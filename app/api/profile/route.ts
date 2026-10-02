import { NextResponse } from "next/server";
import { getAppwriteAccount, getAppwriteSession, appwriteRequest, getAppwriteError } from "@/lib/appwrite/server";
import { createAppwriteRow, listAllAppwriteRows, updateAppwriteRow, appwriteQueries } from "@/lib/appwrite/database";

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
  try {
    const profiles = await listAllAppwriteRows("profiles", [appwriteQueries.queryEqual("user_id", user.$id)], 1);
    if (profiles[0]?.$id) {
      await updateAppwriteRow("profiles", String(profiles[0].$id), { display_name: name });
    } else {
      await createAppwriteRow("profiles", { user_id: user.$id, display_name: name, role: "user" });
    }
  } catch (profileError) {
    console.error("Appwrite profile sync failed", profileError);
  }
  return NextResponse.json({ ok: true });
}
