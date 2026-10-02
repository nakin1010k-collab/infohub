#!/usr/bin/env node

const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1").replace(/\/$/, "");
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || "infohub";
const userId = process.argv[2] || process.env.APPWRITE_BOOTSTRAP_USER_ID;
const role = process.argv[3] || "editor";
const displayName = process.argv.slice(4).join(" ") || process.env.APPWRITE_BOOTSTRAP_DISPLAY_NAME || "InfoHub Editor";

if (!projectId || !apiKey || !userId) {
  throw new Error("Usage: node scripts/bootstrap-appwrite-user.mjs <userId> [editor|admin] [displayName]");
}
if (!["user", "editor", "admin"].includes(role)) throw new Error("Role must be user, editor, or admin.");

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": projectId,
  "X-Appwrite-Key": apiKey,
};

async function request(path, options = {}) {
  const response = await fetch(endpoint + path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  let body = null;
  try { body = await response.json(); } catch {}
  if (!response.ok) throw new Error(body?.message || `Appwrite request failed: ${response.status}`);
  return body;
}

const query = encodeURIComponent(JSON.stringify({ method: "equal", column: "user_id", values: [userId] }));
const existing = await request(`/tablesdb/${encodeURIComponent(databaseId)}/tables/profiles/rows?queries[]=${query}&queries[]=${encodeURIComponent(JSON.stringify({method:"limit",values:[1]}))}`);
const data = { user_id: userId, display_name: displayName.slice(0, 256), role };

if (existing.rows?.[0]?.$id) {
  await request(`/tablesdb/${encodeURIComponent(databaseId)}/tables/profiles/rows/${encodeURIComponent(existing.rows[0].$id)}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  console.log(`Updated InfoHub profile: ${userId} -> ${role}`);
} else {
  await request(`/tablesdb/${encodeURIComponent(databaseId)}/tables/profiles/rows`, {
    method: "POST",
    body: JSON.stringify({ rowId: crypto.randomUUID(), data }),
  });
  console.log(`Created InfoHub profile: ${userId} -> ${role}`);
}
