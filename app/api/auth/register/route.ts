import { NextResponse } from "next/server";
import { APPWRITE_SESSION_COOKIE, appwriteRequest, extractAppwriteSession } from "@/lib/appwrite/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!name || !email || password.length < 8) {
      return NextResponse.json({ error: "กรุณาตรวจสอบข้อมูลการสมัครสมาชิก" }, { status: 400 });
    }

    const userResponse = await appwriteRequest("/account", {
      method: "POST",
      body: JSON.stringify({
        userId: crypto.randomUUID().replaceAll("-", "").slice(0, 36),
        email,
        password,
        name,
      }),
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: "ไม่สามารถสร้างบัญชีได้ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง" }, { status: 400 });
    }

    const sessionResponse = await appwriteRequest("/account/sessions/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!sessionResponse.ok) {
      return NextResponse.json({ ok: true, requiresLogin: true });
    }

    const session = extractAppwriteSession(sessionResponse);
    if (!session) {
      return NextResponse.json({ ok: true, requiresLogin: true });
    }

    const result = NextResponse.json({ ok: true });
    result.cookies.set(APPWRITE_SESSION_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return result;
  } catch {
    return NextResponse.json({ error: "ระบบสมาชิกยังไม่พร้อมใช้งาน กรุณาลองอีกครั้งภายหลัง" }, { status: 503 });
  }
}
