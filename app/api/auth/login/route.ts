import { NextResponse } from "next/server";
import { APPWRITE_SESSION_COOKIE, appwriteRequest, extractAppwriteSession } from "@/lib/appwrite/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 });
    }

    const response = await appwriteRequest("/account/sessions/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง" }, { status: 401 });
    }

    const session = extractAppwriteSession(response);
    if (!session) {
      return NextResponse.json({ error: "ไม่สามารถสร้าง session ได้ กรุณาลองอีกครั้ง" }, { status: 502 });
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
