import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  if (url.searchParams.has("code") && url.pathname === "/") {
    return NextResponse.redirect(
      new URL(`/auth/callback?${url.searchParams.toString()}`, request.url)
    );
  }

  return NextResponse.next();
}