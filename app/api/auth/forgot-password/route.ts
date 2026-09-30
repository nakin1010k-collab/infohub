import { NextResponse } from "next/server";
import { appwriteRequest } from "@/lib/appwrite/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const url = String(body.url ?? "");

    if (!email || !url.startsWith("http")) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลให้ถูกต้อง" }, { status: 400 });
    }

    const response = await appwriteRequest("/account/recovery", {
      method: "POST",
      body: JSON.stringify({ email, url }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "ไม่สามารถส่งลิงก์ตั้งรหัสผ่านใหม่ได้ในขณะนี้ กรุณาลองอีกครั้งภายหลัง" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "ระบบสมาชิกยังไม่พร้อมใช้งาน กรุณาลองอีกครั้งภายหลัง" }, { status: 503 });
  }
}
