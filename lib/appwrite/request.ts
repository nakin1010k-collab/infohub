const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6abd3aa6000db661c656";

export function getAppwriteConfig() {
  return { endpoint, projectId };
}

export async function appwriteRequest(path: string, init: RequestInit = {}, session?: string) {
  const { endpoint, projectId } = getAppwriteConfig();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Appwrite-Project", projectId);
  if (session) headers.set("X-Appwrite-Session", session);
  return fetch(`${endpoint}${path}`, { ...init, headers, cache: "no-store" });
}

export async function extractAppwriteSession(response: Response) {
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const cookieName = `a_session_${getAppwriteConfig().projectId}`;
    const match = setCookie.match(new RegExp(`(?:^|,\\s*)${cookieName}=([^;]+)`));
    if (match?.[1]) return match[1];
  }

  try {
    const payload = await response.clone().json() as { secret?: unknown };
    return typeof payload.secret === "string" ? payload.secret : null;
  } catch {
    return null;
  }
}

export async function getAppwriteError(response: Response) {
  try {
    const payload = await response.clone().json() as { code?: unknown; type?: unknown; message?: unknown };
    return {
      code: typeof payload.code === "number" ? payload.code : response.status,
      type: typeof payload.type === "string" ? payload.type : "",
      message: typeof payload.message === "string" ? payload.message : "",
    };
  } catch {
    return { code: response.status, type: "", message: "" };
  }
}
