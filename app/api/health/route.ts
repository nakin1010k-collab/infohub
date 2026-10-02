import { NextResponse } from "next/server";
import { appwriteRequest, getAppwriteError } from "@/lib/appwrite/request";

const databaseId = process.env.APPWRITE_DATABASE_ID || "infohub";
const tables = {
  articles: process.env.APPWRITE_ARTICLES_TABLE_ID || "articles",
  categories: process.env.APPWRITE_CATEGORIES_TABLE_ID || "categories",
  article_categories: process.env.APPWRITE_ARTICLE_CATEGORIES_TABLE_ID || "article_categories",
  tags: process.env.APPWRITE_TAGS_TABLE_ID || "tags",
  article_tags: process.env.APPWRITE_ARTICLE_TAGS_TABLE_ID || "article_tags",
} as const;

async function checkTable(tableId: string) {
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

export async function GET() {
  const started = Date.now();
  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json(
      { ok: false, service: "infohub", application: "ok", database: "unconfigured", timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }

  try {
    const entries = await Promise.all(
      Object.entries(tables).map(async ([name, tableId]) => [name, await checkTable(tableId)] as const),
    );
    const checks = Object.fromEntries(entries);
    const failed = Object.entries(checks).filter(([, result]) => !result.ok).map(([name]) => name);

    return NextResponse.json(
      {
        ok: failed.length === 0,
        service: "infohub",
        application: "ok",
        database: failed.length === 0 ? "ok" : "partial_error",
        checks,
        failedTables: failed,
        latencyMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      { status: failed.length === 0 ? 200 : 503 },
    );
  } catch (error) {
    console.error("[health] Appwrite check failed", error);
    return NextResponse.json(
      {
        ok: false,
        service: "infohub",
        application: "ok",
        database: "error",
        diagnostic: { type: "network_error", message: error instanceof Error ? error.message : "Unknown error" },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
