import { NextResponse } from "next/server";
import { createAppwriteRow, getAppwriteRow, listAllAppwriteRows, updateAppwriteRow, appwriteQueries } from "@/lib/appwrite/database";
import { requireEditor } from "@/lib/appwrite/auth";
import { checkEditorialQuality } from "@/lib/news/quality";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const auth = await requireEditor();
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.reason === "unauthorized" ? 401 : 403 });
  const body = await request.json().catch(() => ({})) as { status?: "draft"|"published"|"archived" };
  if (!body.status) return NextResponse.json({ error: "ต้องระบุสถานะ" }, { status: 400 });
  const article = await getAppwriteRow("articles", id);
  if (!article) return NextResponse.json({ error: "ไม่พบข่าวนี้" }, { status: 404 });
  const cats = await listAllAppwriteRows("article_categories", [appwriteQueries.queryEqual("article_id", id)]);
  const tags = await listAllAppwriteRows("article_tags", [appwriteQueries.queryEqual("article_id", id)]);
  if (body.status === "published") {
    const quality = checkEditorialQuality({ title: String(article.title??""), excerpt: article.excerpt ? String(article.excerpt) : null, content: String(article.content??""), canonicalUrl: String(article.canonical_url??""), categoryCount: cats.length, tagCount: tags.length });
    if (!quality.ready) return NextResponse.json({ error: "ยังเผยแพร่ไม่ได้", quality }, { status: 422 });
  }
  const previousStatus = String(article.status ?? "draft");
  const publishedAt = body.status === "published" ? (article.published_at ?? new Date().toISOString()) : null;
  try {
    await updateAppwriteRow("articles", id, { status: body.status, published_at: publishedAt });
    const action = body.status === "published" ? "published" : previousStatus === "published" ? "unpublished" : body.status === "archived" ? "archived" : "updated";
    await createAppwriteRow("audit_logs", { article_id:id, actor_id:auth.user.$id, action, metadata:JSON.stringify({ previousStatus, status:body.status }) });
    return NextResponse.json({ ok:true });
  } catch(error) { return NextResponse.json({ error:error instanceof Error?error.message:"อัปเดตสถานะไม่สำเร็จ" }, {status:400}); }
}
