import { NextResponse } from "next/server";
import { appwriteRequest, getAppwriteError } from "@/lib/appwrite/request";
import { listAllAppwriteRows } from "@/lib/appwrite/database";

const databaseId = process.env.APPWRITE_DATABASE_ID || "infohub";
const tables = {
  articles: process.env.APPWRITE_ARTICLES_TABLE_ID || "articles",
  categories: process.env.APPWRITE_CATEGORIES_TABLE_ID || "categories",
  article_categories: process.env.APPWRITE_ARTICLE_CATEGORIES_TABLE_ID || "article_categories",
  tags: process.env.APPWRITE_TAGS_TABLE_ID || "tags",
  article_tags: process.env.async function checkTable(tableId: string) {
  const query = encodeURIComponent(JSON.stringify({ method: "limit", values: [1] }));
  const response = await appwriteRequest(
    `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows?queries[]=${query}`,
    { method: "GET" },
    undefined,
    process.env.APPWRITE_API_KEY,
  );
  if (response.ok) return { ok: true, status: response.status };
  const error = await getAppwriteError(response);
  return { ok: false, status: response.status, code: error.code, type: error.type || undefined, message: error.message || undefined };
}

async function checkNewsReads() {
  const results: Record<string, unknown> = {};
  for (const table of Object.keys(tables)) {
    try {
      const rows = await listAllAppwriteRows(table);
      results[table] = { ok: true, rows: rows.length };
    } catch (error) {
      results[table] = {
        ok: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  return results;
}
