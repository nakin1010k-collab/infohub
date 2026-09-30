import { cookies } from "next/headers";

export const APPWRITE_SESSION_COOKIE = "infohub_appwrite_session";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

export function getAppwriteConfig() {
  if (!endpoint || !projectId) {
    throw new Error("Appwrite environment variables are not configured.");
  }
  return { endpoint, projectId };
}

export async function appwriteRequest(
  path: string,
  init: RequestInit = {},
  session?: string,
) {
  const { endpoint, projectId } = getAppwriteConfig();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Appwrite-Project", projectId);
  if (session) headers.set("X-Appwrite-Session", session);

  return fetch(`${endpoint}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export function extractAppwriteSession(response: Response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return null;

  const cookieName = `a_session_${getAppwriteConfig().projectId}`;
  const match = setCookie.match(new RegExp(`(?:^|,\\s*)${cookieName}=([^;]+)`));
  return match?.[1] ?? null;
}

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
