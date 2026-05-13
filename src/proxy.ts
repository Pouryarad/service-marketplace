import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const protectedRoutes = [
    "/dashboard",
    "/provider/dashboard",
    "/provider/setup",
    "/provider/requests",
    "/admin",
  ];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  if (user) {
    const role = request.cookies.get("user-role")?.value ?? null;

    if (pathname.startsWith("/dashboard") && role === "provider") {
      return NextResponse.redirect(new URL("/provider/dashboard", url.origin));
    }

    const isProviderRoute = pathname.startsWith("/provider/") && !pathname.startsWith("/providers/");

    if (isProviderRoute) {
      if (role === "client") {
        return NextResponse.redirect(new URL("/dashboard", url.origin));
      }

      if (role === "admin" && !request.cookies.get("impersonating_provider_id")) {
        return NextResponse.redirect(new URL("/admin", url.origin));
      }
    }
  }

  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};