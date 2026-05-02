import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // if Supabase sends ?code= to root, redirect to callback
  if (url.searchParams.has("code") && !url.pathname.startsWith("/auth/callback")) {
    return NextResponse.redirect(
      new URL(`/auth/callback?${url.searchParams.toString()}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};