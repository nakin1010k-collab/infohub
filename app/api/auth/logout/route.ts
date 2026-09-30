import { NextResponse } from "next/server";
import { APPWRITE_SESSION_COOKIE, appwriteRequest, getAppwriteSession } from "@/lib/appwrite/server";

export async function POST() {
  const session = await getAppwriteSession();
  if (session) {
    try {
      await appwriteRequest("/account/sessions/current", { method: "DELETE" }, session);
    } catch {
      // Clear the local session even if Appwrite is temporarily unavailable.
    }
  }

  const result = NextResponse.json({ ok: true });
  result.cookies.set(APPWRITE_SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return result;
}
