import { appwriteRequest, getAppwriteConfig } from "@/lib/appwrite/server";

type Row = Record<string, unknown> & { $id?: string };

const databaseId = () => process.env.APPWRITE_DATABASE_ID || "infohub";

function tableId(name: string) {
  const map: Record<string, string | undefined> = {
    articles: process.env.APPWRITE_ARTICLES_TABLE_ID || "articles",
    categories: process.env.APPWRITE_CATEGORIES_TABLE_ID || "categories",
    article_categories: process.env.APPWRITE_ARTICLE_CATEGORIES_TABLE_ID || "article_categories",
    tags: process.env.APPWRITE_TAGS_TABLE_ID || "tags",
    article_tags: process.env.APPWRITE_ARTICLE_TAGS_TABLE_ID || "article_tags",
    profiles: process.env.APPWRITE_PROFILES_TABLE_ID || "profiles",
    audit_logs: process.env.APPWRITE_AUDIT_LOGS_TABLE_ID || "audit_logs",
    sources: process.env.APPWRITE_SOURCES_TABLE_ID || "sources",
    ingestion_runs: process.env.APPWRITE_INGESTION_RUNS_TABLE_ID || "ingestion_runs",
    notifications: process.env.APPWRITE_NOTIFICATIONS_TABLE_ID || "notifications",
  };
  return map[name];
}

function requireTable(name: string) {
  const dbId = databaseId();
  const id = tableId(name);
  if (!dbId || !id) throw new Error(`Appwrite table configuration missing: ${name}`);
  return { databaseId: dbId, id };
}

function queryEqual(field: string, value: string | boolean) {
  return JSON.stringify({ method: "equal", column: field, values: [value] });
}
function querySearch(field: string, value: string) {
  return JSON.stringify({ method: "search", column: field, values: [value] });
}
function queryOrderDesc(field: string) {
  return JSON.stringify({ method: "orderDesc", column: field });
}
function queryOrderAsc(field: string) {
  return JSON.stringify({ method: "orderAsc", column: field });
}
function queryLimit(limit: number) {
  return JSON.stringify({ method: "limit", values: [limit] });
}
function queryOffset(offset: number) {
  return JSON.stringify({ method: "offset", values: [offset] });
}

export async function listAppwriteRows(table: string, queries: string[] = [], limit = 100) {
  const { databaseId, id } = requireTable(table);
  const params = new URLSearchParams();
  for (const query of [...queries, queryLimit(Math.min(100, Math.max(1, limit)))]) {
    params.append("queries[]", query);
  }
  const response = await appwriteRequest(
    `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows?${params}`,
    { method: "GET" },
    undefined,
    process.env.APPWRITE_API_KEY,
  );
  if (!response.ok) throw new Error(`Appwrite table read failed (${table}): ${response.status}`);
  const payload = await response.json() as { rows?: Row[] };
  return payload.rows ?? [];
}

export async function listAllAppwriteRows(table: string, queries: string[] = [], pageSize = 100) {
  const rows: Row[] = [];
  let offset = 0;
  while (true) {
    const batch = await listAppwriteRows(table, [...queries, queryOffset(offset)], pageSize);
    rows.push(...batch);
    if (batch.length < pageSize) break;
    offset += pageSize;
    if (offset > 10000) break;
  }
  return rows;
}

export async function getAppwriteRow(table: string, rowId: string) {
  const { databaseId, id } = requireTable(table);
  const response = await appwriteRequest(
    `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows/${encodeURIComponent(rowId)}`,
    { method: "GET" },
    undefined,
    process.env.APPWRITE_API_KEY,
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Appwrite row read failed (${table}): ${response.status}`);
  return response.json() as Promise<Row>;
}

export async function createAppwriteRow(table: string, data: Row) {
  const { databaseId, id } = requireTable(table);
  const response = await appwriteRequest(
    `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows`,
    {
      method: "POST",
      body: JSON.stringify({ rowId: crypto.randomUUID(), data }),
    },
    undefined,
    process.env.APPWRITE_API_KEY,
  );
  if (!response.ok) throw new Error(`Appwrite row create failed (${table}): ${response.status}`);
  return response.json() as Promise<Row>;
}

export async function updateAppwriteRow(table: string, rowId: string, data: Row) {
  const { databaseId, id } = requireTable(table);
  const response = await appwriteRequest(
    `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows/${encodeURIComponent(rowId)}`,
    { method: "PATCH", body: JSON.stringify({ data }) },
    undefined,
    process.env.APPWRITE_API_KEY,
  );
  if (!response.ok) throw new Error(`Appwrite row update failed (${table}): ${response.status}`);
  return response.json() as Promise<Row>;
}

export async function deleteAppwriteRow(table: string, rowId: string) {
  const { databaseId, id } = requireTable(table);
  const response = await appwriteRequest(
    `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows/${encodeURIComponent(rowId)}`,
    { method: "DELETE" },
    undefined,
    process.env.APPWRITE_API_KEY,
  );
  if (!response.ok) throw new Error(`Appwrite row delete failed (${table}): ${response.status}`);
}

export const appwriteQueries = { queryEqual, querySearch, queryOrderDesc, queryOrderAsc, queryLimit, queryOffset };
export { getAppwriteConfig };
