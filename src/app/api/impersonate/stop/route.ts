import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/users?tab=providers", request.url));
  response.cookies.delete("impersonating_provider_id");
  return response;
}