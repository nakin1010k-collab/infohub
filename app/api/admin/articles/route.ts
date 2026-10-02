import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { tagSlugify } from "@/lib/news/editorial";
import { appwriteQueries, listAllAppwriteRows, runAppwriteTransaction } from "@/lib/appwrite/database";
import { requireEditor } from "@/lib/appwrite/auth";
import { getSiteUrl } from "@/lib/site-url";
import { checkEditorialQuality } from "@/lib/news/quality";

type Payload = {
  title?: string; slug?: string; excerpt?: string; content?: string;
  status?: "draft" | "published" | "archived"; categoryId?: string;
  tags?: string; readingMinutes?: number | string; imageUrl?: string;
};

const slugify = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const parseTags = (v?: string) => Array.from(new Set((v ?? "").split(",").map((x) => x.trim()).filter(Boolean))).slice(0, 12);

export async function POST(request: Request) {
  const auth = await requireEditor();
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.reason === "unauthorized" ? 401 : 403 });

  const b = (await request.json()) as Payload;
  const title = b.title?.trim() ?? "";
  const slug = slugify(b.slug || title);
  const content = b.content?.trim() ?? "";
  const categoryId = b.categoryId?.trim() ?? "";
  const status = b.status ?? "draft";

  if (!title || !slug || !content || !categoryId) {
    return NextResponse.json({ error: "กรอกหัวข้อ, slug, เนื้อหา และหมวดหมู่ให้ครบ" }, { status: 400 });
  }

  const minutes = Number(b.readingMinutes) || Math.max(1, Math.ceil(content.length / 600));
  const imageUrl = b.imageUrl?.trim() || null;
  const excerpt = b.excerpt?.trim() ?? "";

  if (imageUrl) {
    try {
      const u = new URL(imageUrl);
      if (u.protocol !== "https:") return NextResponse.json({ error: "รูปภาพต้องใช้ HTTPS" }, { status: 400 });
    } catch {
      return NextResponse.json({ error: "URL รูปภาพไม่ถูกต้อง" }, { status: 400 });
    }
  }

  const canonicalUrl = new URL(`/news/${slug}`, getSiteUrl()).toString();
  const canonicalUrlHash = createHash("sha256").update(canonicalUrl).digest("hex");
  const publishedAt = status === "published" ? new Date().toISOString() : null;
  const tagPayload = parseTags(b.tags).map((name) => ({ name, slug: tagSlugify(name) })).filter((tag) => tag.slug);

  if (status === "published") {
    const quality = checkEditorialQuality({
      title, excerpt: excerpt || null, content, canonicalUrl,
      categoryCount: 1, tagCount: tagPayload.length,
    });
    if (!quality.ready) return NextResponse.json({ error: "ยังเผยแพร่ไม่ได้", quality }, { status: 422 });
  }

  try {
    const articleId = crypto.randomUUID();
    const operations: Array<{
      action: "create"; databaseId: string; tableId: string; rowId: string; data: Record<string, unknown>;
    }> = [];
    const databaseId = process.env.APPWRITE_DATABASE_ID || "infohub";
    const table = (name: string) => {
      const map: Record<string, string | undefined> = {
        articles: process.env.APPWRITE_ARTICLES_TABLE_ID || "articles",
        article_categories: process.env.APPWRITE_ARTICLE_CATEGORIES_TABLE_ID || "article_categories",
        tags: process.env.APPWRITE_TAGS_TABLE_ID || "tags",
        article_tags: process.env.APPWRITE_ARTICLE_TAGS_TABLE_ID || "article_tags",
        audit_logs: process.env.APPWRITE_AUDIT_LOGS_TABLE_ID || "audit_logs",
      };
      const value = map[name];
      if (!value) throw new Error(`Appwrite table configuration missing: ${name}`);
      return value;
    };

    operations.push({
      action: "create", databaseId, tableId: table("articles"), rowId: articleId,
      data: {
        title, slug, excerpt, content, status, category_id: categoryId,
        reading_minutes: minutes, canonical_url: canonicalUrl, canonical_url_hash: canonicalUrlHash,
        published_at: publishedAt, image_url: imageUrl, created_by: auth.user.$id,
      },
    });
    operations.push({
      action: "create", databaseId, tableId: table("article_categories"), rowId: crypto.randomUUID(),
      data: { article_id: articleId, category_id: categoryId },
    });

    const tags = [];
    for (const tag of tagPayload) {
      const existing = (await listAllAppwriteRows("tags", [appwriteQueries.queryEqual("slug", tag.slug)], 10))[0];
      const tagId = String(existing?.$id ?? crypto.randomUUID());
      if (!existing) {
        operations.push({ action: "create", databaseId, tableId: table("tags"), rowId: tagId, data: tag });
      }
      tags.push(tagId);
    }

    for (const tagId of tags) {
      operations.push({
        action: "create", databaseId, tableId: table("article_tags"), rowId: crypto.randomUUID(),
        data: { article_id: articleId, tag_id: tagId },
      });
    }

    const now = new Date().toISOString();
    operations.push({
      action: "create", databaseId, tableId: table("audit_logs"), rowId: crypto.randomUUID(),
      data: { article_id: articleId, actor_id: auth.user.$id, action: "created", metadata: JSON.stringify({ status }), created_at: now },
    });
    if (status === "published") {
      operations.push({
        action: "create", databaseId, tableId: table("audit_logs"), rowId: crypto.randomUUID(),
        data: { article_id: articleId, actor_id: auth.user.$id, action: "published", metadata: "{}", created_at: now },
      });
    }

    await runAppwriteTransaction(operations);
    return NextResponse.json({ article: { id: articleId, slug } }, { status: 201 });
  } catch (error) {
    console.error("Appwrite article create failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "บันทึกข่าวไม่สำเร็จ" }, { status: 400 });
  }
}
