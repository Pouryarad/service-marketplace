import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Protected routes
  const protectedRoutes = [
    "/dashboard",
    "/provider/dashboard",
    "/provider/setup",
    "/provider/requests",
    "/admin",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

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

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  // Redirect authenticated providers away from client dashboard
  if (pathname.startsWith("/dashboard") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "provider") {
      return NextResponse.redirect(new URL("/provider/dashboard", url.origin));
    }
  }

// Redirect authenticated clients away from provider dashboard
  if (pathname.startsWith("/provider") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "client") {
      return NextResponse.redirect(new URL("/dashboard", url.origin));
    }
  }

  // Redirect admin away from provider routes to admin panel
  if (pathname.startsWith("/provider") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", url.origin));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};