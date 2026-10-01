import { NextResponse } from "next/server";
import { getAppwriteAccount, getAppwriteSession, appwriteRequest, getAppwriteError } from "@/lib/appwrite/server";

export async function PATCH(request: Request) {
  const session = await getAppwriteSession();
  const user = await getAppwriteAccount();
  if (!session || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { displayName?: string };
  const name = body.displayName?.trim().slice(0, 120) ?? "";
  const response = await appwriteRequest("/account", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  }, session);
  if (!response.ok) {
    const error = await getAppwriteError(response);
    return NextResponse.json({ error: error.message || "บันทึกโปรไฟล์ไม่สำเร็จ" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
