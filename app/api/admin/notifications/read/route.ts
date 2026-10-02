import { NextResponse } from "next/server";
import { updateAppwriteRow } from "@/lib/appwrite/database";
import { getCurrentAppwriteUser } from "@/lib/appwrite/auth";

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({})) as { id?: string };
  if (!body.id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const current = await getCurrentAppwriteUser();
  if (!current) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await updateAppwriteRow("notifications", body.id, { read_at: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[notifications/read] update failed", error);
    return NextResponse.json({ error: "อัปเดตแจ้งเตือนไม่สำเร็จ" }, { status: 400 });
  }
}
