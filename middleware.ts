import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/profile", "/dashboard", "/settings"];

function copyResponseState(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }

  return target;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: "Authentication service is not configured." },
      { status: 503 }
    );
  }

  const response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data: claimsData, error } = await supabase.auth.getClaims();

    if (error) {
      return copyResponseState(
        response,
        NextResponse.json(
          { error: "Authentication service is temporarily unavailable." },
          { status: 503 }
        ),
      );
    }

    if (!claimsData?.claims) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("next", pathname);

      return copyResponseState(response, NextResponse.redirect(loginUrl));
    }
  } catch {
    return copyResponseState(
      response,
      NextResponse.json(
        { error: "Authentication service is temporarily unavailable." },
        { status: 503 }
      ),
    );
  }

  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/settings/:path*"],
};
