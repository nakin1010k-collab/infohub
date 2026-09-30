import { NextResponse } from "next/server";
import { appwriteRequest } from "@/lib/appwrite/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = String(body.userId ?? "");
    const secret = String(body.secret ?? "");
    const password = String(body.password ?? "");

    if (!userId || !secret || password.length < 8) {
      return NextResponse.json({ error: "ลิงก์หรือข้อมูลตั้งรหัสผ่านไม่ถูกต้อง" }, { status: 400 });
    }

    const response = await appwriteRequest("/account/recovery", {
      method: "PUT",
      body: JSON.stringify({ userId, secret, password }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "ไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาขอลิงก์ใหม่อีกครั้ง" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "ระบบสมาชิกยังไม่พร้อมใช้งาน กรุณาลองอีกครั้งภายหลัง" }, { status: 503 });
  }
}
