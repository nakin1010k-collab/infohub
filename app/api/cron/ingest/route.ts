import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import {
  appwriteQueries, createAppwriteRow, listAllAppwriteRows, runAppwriteTransaction, updateAppwriteRow,
  type AppwriteTransactionOperation,
} from "@/lib/appwrite/database";
import { fetchFeed } from "@/lib/news/rss";
import { enrichWithoutAI } from "@/lib/news/editorial";

const CRON_ACTOR_ID = "system:cron";
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sources = await listAllAppwriteRows("sources", [
    appwriteQueries.queryEqual("is_active", true),
  ], 100);
  const results = [];

  for (const source of sources) {
    const sourceId = String(source.$id ?? "");
    const sourceName = String(source.name ?? sourceId);
    const feedUrl = String(source.feed_url ?? "");
    if (!sourceId || !feedUrl) continue;

    const stale = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const runningRows = await listAllAppwriteRows("ingestion_runs", [
      appwriteQueries.queryEqual("source_id", sourceId),
      appwriteQueries.queryEqual("status", "running"),
    ], 100);

    for (const row of runningRows) {
      if (String(row.started_at ?? "") < stale) {
        await updateAppwriteRow("ingestion_runs", String(row.$id), {
          status: "failed",
          error_message: "Timed out before scheduled run",
          finished_at: new Date().toISOString(),
        });
      }
    }

    const activeRuns = runningRows.filter((row) => String(row.started_at ?? "") >= stale);
    if (activeRuns.length) {
      results.push({ source: sourceName, status: "busy" });
      continue;
    }

    const run = await createAppwriteRow("ingestion_runs", {
      source_id: sourceId,
      status: "running",
      started_at: new Date().toISOString(),
      items_seen: 0,
      items_created: 0,
      items_skipped: 0,
      items_failed: 0,
    });

    try {
      const items = await fetchFeed(feedUrl);
      let created = 0;
      let duplicates = 0;
      let failed = 0;
      let ruleEnriched = 0;
      const failures: Array<{ url?: string; title?: string; reason: string }> = [];
      const itemDetails: Array<{ url?: string; title?: string; outcome: string; reason?: string }> = [];
      const categories = await listAllAppwriteRows("categories", [
        appwriteQueries.queryEqual("is_active", true),
        appwriteQueries.queryOrderAsc("sort_order"),
      ], 100);
      const categoryModels = categories.map((c) => ({
        id: String(c.$id), name: String(c.name ?? ""), slug: String(c.slug ?? ""),
      }));

      for (const item of items) {
        try {
          const canonicalUrlHash = createHash("sha256").update(item.url).digest("hex");
          const duplicate = await listAllAppwriteRows("articles", [
            appwriteQueries.queryEqual("canonical_url_hash", canonicalUrlHash),
          ], 5);
          if (duplicate.length) {
            duplicates++;
            itemDetails.push({ url: item.url, title: item.title?.slice(0, 180), outcome: "duplicate" });
            continue;
          }

          const articleId = crypto.randomUUID();
          const articleData = {
            slug: `${slugify(item.title) || "imported"}-${crypto.randomUUID().slice(0, 8)}`,
            title: item.title.slice(0, 180),
            excerpt: item.excerpt?.slice(0, 500) || item.title.slice(0, 500),
            content: item.excerpt || item.title,
            status: "draft",
            canonical_url: item.url,
            canonical_url_hash: canonicalUrlHash,
            reading_minutes: Math.max(1, Math.ceil((item.excerpt || item.title).length / 600)),
            image_url: item.imageUrl || null,
            source_id: sourceId,
            created_by: CRON_ACTOR_ID,
            published_at: null,
          };

          const enriched = enrichWithoutAI({
            title: articleData.title,
            excerpt: articleData.excerpt,
            content: articleData.content,
            readingMinutes: articleData.reading_minutes,
          }, categoryModels);

          const databaseId = process.env.APPWRITE_DATABASE_ID || "infohub";
          const articlesTable = process.env.APPWRITE_ARTICLES_TABLE_ID || "articles";
          const tagsTable = process.env.APPWRITE_TAGS_TABLE_ID || "tags";
          const articleCategoriesTable = process.env.APPWRITE_ARTICLE_CATEGORIES_TABLE_ID || "article_categories";
          const articleTagsTable = process.env.APPWRITE_ARTICLE_TAGS_TABLE_ID || "article_tags";
          const auditTable = process.env.APPWRITE_AUDIT_LOGS_TABLE_ID || "audit_logs";

          const operations: AppwriteTransactionOperation[] = [{
            action: "create" as const,
            databaseId,
            tableId: articlesTable,
            rowId: articleId,
            data: articleData,
          }];

          if (enriched.category) {
            operations.push({
              action: "create" as const,
              databaseId,
              tableId: articleCategoriesTable,
              rowId: crypto.randomUUID(),
              data: { article_id: articleId, category_id: enriched.category.id },
            });

            for (const tag of enriched.tags) {
              const existingTag = (await listAllAppwriteRows("tags", [
                appwriteQueries.queryEqual("slug", tag.slug),
              ], 5))[0];
              const tagId = existingTag?.$id || crypto.randomUUID();
              if (!existingTag) {
                operations.push({
                  action: "create" as const,
                  databaseId,
                  tableId: tagsTable,
                  rowId: tagId,
                  data: { name: tag.name, slug: tag.slug },
                });
              }
              operations.push({
                action: "create" as const,
                databaseId,
                tableId: articleTagsTable,
                rowId: crypto.randomUUID(),
                data: { article_id: articleId, tag_id: tagId },
              });
            }

            operations.push({
              action: "update" as const,
              databaseId,
              tableId: articlesTable,
              rowId: articleId,
              data: { category_id: enriched.category.id, reading_minutes: enriched.readingMinutes },
            });
          }

          operations.push({
            action: "create" as const,
            databaseId,
            tableId: auditTable,
            rowId: crypto.randomUUID(),
            data: {
              article_id: articleId,
              actor_id: CRON_ACTOR_ID,
              action: "imported",
              metadata: JSON.stringify({ sourceId, sourceName, mode: "scheduled" }),
              created_at: new Date().toISOString(),
            },
          });

          await runAppwriteTransaction(operations);
          if (enriched.category) ruleEnriched++;
          created++;
          itemDetails.push({ url: item.url, title: item.title?.slice(0, 180), outcome: "created" });
        } catch (error) {
          failed++;
          const reason = error instanceof Error ? error.message : "Unknown import error";
          failures.push({ url: item.url, title: item.title?.slice(0, 180), reason });
          itemDetails.push({ url: item.url, title: item.title?.slice(0, 180), outcome: "failed", reason });
        }
      }

      const status = failed ? (created ? "partial" : "failed") : "success";
      await updateAppwriteRow("ingestion_runs", String(run.$id), {
        status,
        items_seen: items.length,
        items_created: created,
        items_skipped: duplicates,
        items_failed: failed,
        error_message: failures.length ? `Scheduled import failed for ${failed} item(s)` : null,
        failure_details: JSON.stringify(failures.slice(0, 50)),
        item_details: JSON.stringify(itemDetails.slice(0, 500)),
        finished_at: new Date().toISOString(),
      });
      if (status !== "failed") await updateAppwriteRow("sources", sourceId, { last_ingested_at: new Date().toISOString() });
      results.push({
        source: sourceName, status, itemsSeen: items.length, itemsCreated: created,
        duplicates, failed, ruleEnriched,
      });
    } catch (error) {
      await updateAppwriteRow("ingestion_runs", String(run.$id), {
        status: "failed",
        error_message: error instanceof Error ? error.message : "Scheduled feed import failed",
        finished_at: new Date().toISOString(),
      });
      results.push({ source: sourceName, status: "failed" });
    }
  }

  return NextResponse.json({ ok: true, scheduled: true, backend: "appwrite", results });
}
