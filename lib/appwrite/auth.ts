import { getAppwriteAccount } from "@/lib/appwrite/server";
import { listAllAppwriteRows, appwriteQueries } from "@/lib/appwrite/database";

export type AppwriteProfile = { $id?: string; id?: string; display_name?: string | null; role?: string | null; };

export async function getCurrentAppwriteUser() {
  const user = await getAppwriteAccount();
  if (!user) return null;
  const rows = await listAllAppwriteRows("profiles", [appwriteQueries.queryEqual("user_id", user.$id)], 10);
  const profile = (rows[0] ?? null) as AppwriteProfile | null;
  return { user, profile };
}

export async function requireEditor() {
  const current = await getCurrentAppwriteUser();
  if (!current) return { ok: false as const, reason: "unauthorized" as const };
  if (!["editor", "admin"].includes(String(current.profile?.role ?? ""))) return { ok: false as const, reason: "forbidden" as const };
  return { ok: true as const, ...current };
}
