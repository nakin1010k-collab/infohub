const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

export function getAppwriteConfig() {
  if (!endpoint || !projectId) {
    throw new Error("Appwrite environment variables are not configured.");
  }

  return { endpoint, projectId };
}
