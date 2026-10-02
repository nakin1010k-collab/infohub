import { NextResponse } from "next/server";
import { appwriteQueries, getAppwriteRow, listAllAppwriteRows, runAppwriteTransaction } from "@/lib/appwrite/database";
import { requireEditor } from "@/lib/appwrite/auth";
import { checkEditorialQuality } from "@/lib/news/quality";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireEditor();
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.reason === "unauthorized" ? 401 : 403 });

  const body = await request.json().catch(() => ({})) as { status?: "draft" | "published" | "archived" };
  if (!body.status) return NextResponse.json({ error: "ต้องระบุสถานะ" }, { status: 400 });

  const article = await getAppwriteRow("articles", id);
  if (!article) return NextResponse.json({ error: "ไม่พบข่าวนี้" }, { status: 404 });

  const cats = await listAllAppwriteRows("article_categories", [appwriteQueries.queryEqual("article_id", id)], 100);
  const tags = await listAllAppwriteRows("article_tags", [appwriteQueries.queryEqual("article_id", id)], 100);
  if (body.status === "published") {
    const quality = checkEditorialQuality({
      title: String(article.title ?? ""),
      excerpt: article.excerpt ? String(article.excerpt) : null,
      content: String(article.content ?? ""),
      canonicalUrl: String(article.canonical_url ?? ""),
      categoryCount: cats.length,
      tagCount: tags.length,
    });
    if (!quality.ready) return NextResponse.json({ error: "ยังเผยแพร่ไม่ได้", quality }, { status: 422 });
  }

  const previousStatus = String(article.status ?? "draft");
  const publishedAt = body.status === "published" ? (article.published_at ?? new Date().toISOString()) : null;
  const databaseId = process.env.APPWRITE_DATABASE_ID || "infohub";
  const articlesTable = process.env.APPWRITE_ARTICLES_TABLE_ID || "articles";
  const auditTable = process.env.APPWRITE_AUDIT_LOGS_TABLE_ID || "audit_logs";

  try {
    const action = body.status === "published"
      ? "published"
      : previousStatus === "published"
        ? "unpublished"
        : body.status === "archived"
          ? "archived"
          : "updated";
    await runAppwriteTransaction([
      {
        action: "update", databaseId, tableId: articlesTable, rowId: id,
        data: { status: body.status, published_at: publishedAt },
      },
      {
        action: "create", databaseId, tableId: auditTable, rowId: crypto.randomUUID(),
        data: {
          article_id: id, actor_id: auth.user.$id, action,
          metadata: JSON.stringify({ previousStatus, status: body.status }),
          created_at: new Date().toISOString(),
        },
      },
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Appwrite article status update failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "อัปเดตสถานะไม่สำเร็จ" }, { status: 400 });
  }
}
