import { NextResponse, type NextRequest } from "next/server";
import { appwriteRequest } from "@/lib/appwrite/request";
import { APPWRITE_SESSION_COOKIE } from "@/lib/appwrite/session";

const protectedRoutes = ["/profile", "/dashboard", "/settings", "/admin"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(APPWRITE_SESSION_COOKIE)?.value;
  if (!session) return redirectToLogin(request);

  try {
    const response = await appwriteRequest("/account", { method: "GET" }, session);
    if (!response.ok) return redirectToLogin(request);
  } catch {
    return NextResponse.json({ error: "Authentication service is temporarily unavailable." }, { status: 503 });
  }
  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(APPWRITE_SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}

export const config = { matcher: ["/profile/:path*", "/dashboard/:path*", "/settings/:path*", "/admin/:path*"] };
