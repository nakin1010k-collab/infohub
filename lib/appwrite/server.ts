import { cookies } from "next/headers";
import { APPWRITE_SESSION_COOKIE } from "@/lib/appwrite/session";
import { appwriteRequest, extractAppwriteSession, getAppwriteConfig, getAppwriteError } from "@/lib/appwrite/request";

export { APPWRITE_SESSION_COOKIE, appwriteRequest, extractAppwriteSession, getAppwriteConfig, getAppwriteError };

export async function getAppwriteSession() {
  return (await cookies()).get(APPWRITE_SESSION_COOKIE)?.value ?? null;
}

export async function getAppwriteAccount() {
  const session = await getAppwriteSession();
  if (!session) return null;
  const response = await appwriteRequest("/account", { method: "GET" }, session);
  if (!response.ok) return null;
  return response.json() as Promise<{ $id: string; name: string; email: string }>;
}
