import { NextResponse } from "next/server";
import { appwriteRequest, getAppwriteSession } from "@/lib/appwrite/server";

export async function GET() {
  const session = await getAppwriteSession();
  if (!session) return NextResponse.json({ authenticated: false });
  try {
    const response = await appwriteRequest("/account", { method: "GET" }, session);
    return NextResponse.json({ authenticated: response.ok });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
