import { appwriteRequest, getAppwriteConfig } from "@/lib/appwrite/server";

type Row = Record<string, any> & { $id?: string };

function tableId(name: string) {
  const map: Record<string, string | undefined> = {
    articles: process.env.APPWRITE_ARTICLES_TABLE_ID,
    categories: process.env.APPWRITE_CATEGORIES_TABLE_ID,
    article_categories: process.env.APPWRITE_ARTICLE_CATEGORIES_TABLE_ID,
    tags: process.env.APPWRITE_TAGS_TABLE_ID,
    article_tags: process.env.APPWRITE_ARTICLE_TAGS_TABLE_ID,
    profiles: process.env.APPWRITE_PROFILES_TABLE_ID,
    audit_logs: process.env.APPWRITE_AUDIT_LOGS_TABLE_ID,
  };
  return map[name];
}

function requireTable(name: string) {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const id = tableId(name);
  if (!databaseId || !id) throw new Error(`Appwrite table configuration missing: ${name}`);
  return { databaseId, id };
}

function queryEqual(field: string, value: string | boolean) {
  const serialized = JSON.stringify([value]);
  return `Query.equal("${field}",${serialized})`;
}
function querySearch(field: string, value: string) {
  return `Query.search("${field}",${JSON.stringify(value)})`;
}
function queryOrderDesc(field: string) { return `Query.orderDesc("${field}")`; }
function queryOrderAsc(field: string) { return `Query.orderAsc("${field}")`; }
function queryLimit(limit: number) { return `Query.limit(${limit})`; }
function queryOffset(offset: number) { return `Query.offset(${offset})`; }

export async function listAppwriteRows(table: string, queries: string[] = [], limit = 100) {
  const { databaseId, id } = requireTable(table);
  const params = new URLSearchParams();
  for (const query of [...queries, queryLimit(Math.min(100, Math.max(1, limit)))]) params.append("queries[]", query);
  const response = await appwriteRequest(`/databases/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows?${params}`, { method: "GET" });
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
  const response = await appwriteRequest(`/databases/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows/${encodeURIComponent(rowId)}`, { method: "GET" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Appwrite row read failed (${table}): ${response.status}`);
  return response.json() as Promise<Row>;
}

export async function createAppwriteRow(table: string, data: Row) {
  const { databaseId, id } = requireTable(table);
  const response = await appwriteRequest(`/databases/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows`, {
    method: "POST",
    body: JSON.stringify({ rowId: crypto.randomUUID(), data }),
  }, undefined, process.env.APPWRITE_API_KEY);
  if (!response.ok) throw new Error(`Appwrite row create failed (${table}): ${response.status}`);
  return response.json() as Promise<Row>;
}

export async function updateAppwriteRow(table: string, rowId: string, data: Row) {
  const { databaseId, id } = requireTable(table);
  const response = await appwriteRequest(`/databases/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows/${encodeURIComponent(rowId)}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  }, process.env.APPWRITE_API_KEY);
  if (!response.ok) throw new Error(`Appwrite row update failed (${table}): ${response.status}`);
  return response.json() as Promise<Row>;
}

export async function deleteAppwriteRow(table: string, rowId: string) {
  const { databaseId, id } = requireTable(table);
  const response = await appwriteRequest(`/databases/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(id)}/rows/${encodeURIComponent(rowId)}`, {
    method: "DELETE",
  }, process.env.APPWRITE_API_KEY);
  if (!response.ok) throw new Error(`Appwrite row delete failed (${table}): ${response.status}`);
}

export const appwriteQueries = { queryEqual, querySearch, queryOrderDesc, queryOrderAsc, queryLimit, queryOffset };
export { getAppwriteConfig };
