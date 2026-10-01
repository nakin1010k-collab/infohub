const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6abd3aa6000db661c656";

export function getAppwriteConfig() {
  return { endpoint, projectId };
}
