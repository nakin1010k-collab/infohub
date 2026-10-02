import { NextResponse } from "next/server";

function isSafeInternalPath(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next");
  const destination = isSafeInternalPath(next) ? next : "/";
  return NextResponse.redirect(new URL(`/login?error=auth_callback&next=${encodeURIComponent(destination)}`, requestUrl.origin));
}
