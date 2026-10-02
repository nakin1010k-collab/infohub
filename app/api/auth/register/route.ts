import { NextResponse } from "next/server";
import { APPWRITE_SESSION_COOKIE, appwriteRequest, extractAppwriteSession, getAppwriteError } from "@/lib/appwrite/server";
import { createAppwriteRow } from "@/lib/appwrite/database";

function friendlyRegisterError(type: string, message: string) {
  if (type === "user_already_exists" || type === "user_already_exists_with_same_email") return "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบแทน";
  if (type === "password_too_short") return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  if (type === "user_invalid_email") return "รูปแบบอีเมลไม่ถูกต้อง";
  if (type === "general_rate_limit_exceeded") return "ลองสมัครบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่";
  if (message && /project/i.test(message)) return "ระบบสมาชิกเชื่อมต่อโครงการ Appwrite ไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าโครงการ";
  return "ไม่สามารถสร้างบัญชีได้ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!name || !email || password.length < 8) return NextResponse.json({ error: "กรุณาตรวจสอบข้อมูลการสมัครสมาชิก" }, { status: 400 });

    const userResponse = await appwriteRequest("/account", { method: "POST", body: JSON.stringify({
      userId: crypto.randomUUID().replaceAll("-", "").slice(0, 36), email, password, name,
    })});
    if (!userResponse.ok) {
      const error = await getAppwriteError(userResponse);
      console.error("Appwrite register failed", error);
      return NextResponse.json({ error: friendlyRegisterError(error.type, error.message) }, { status: userResponse.status >= 500 ? 503 : 400 });
    }

    const createdUser = await userResponse.json() as { $id?: string };
    const userId = String(createdUser.$id ?? "");
    if (!userId) return NextResponse.json({ error: "สร้างบัญชีสำเร็จแต่ไม่พบรหัสผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ" }, { status: 503 });

    try {
      await createAppwriteRow("profiles", { user_id: userId, display_name: name, role: "user" });
    } catch (profileError) {
      console.error("Appwrite profile bootstrap failed", profileError);
      if (process.env.APPWRITE_API_KEY) {
        try {
          await appwriteRequest(
            `/users/${encodeURIComponent(userId)}`,
            { method: "DELETE" },
            undefined,
            process.env.APPWRITE_API_KEY,
          );
        } catch (cleanupError) {
          console.error("Appwrite registration cleanup failed", cleanupError);
        }
      }
      return NextResponse.json({ error: "ไม่สามารถตั้งค่าโปรไฟล์หลังสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง" }, { status: 503 });
    }

    const sessionResponse = await appwriteRequest("/account/sessions/email", { method: "POST", body: JSON.stringify({ email, password }) });
    if (!sessionResponse.ok) return NextResponse.json({ ok: true, requiresLogin: true });
    const session = await extractAppwriteSession(sessionResponse);
    if (!session) return NextResponse.json({ ok: true, requiresLogin: true });

    const result = NextResponse.json({ ok: true });
    result.cookies.set(APPWRITE_SESSION_COOKIE, session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return result;
  } catch {
    return NextResponse.json({ error: "ระบบสมาชิกยังไม่พร้อมใช้งาน กรุณาลองอีกครั้งภายหลัง" }, { status: 503 });
  }
}
