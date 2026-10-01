import { NextResponse } from "next/server";
import { recordArticleAudit } from "@/lib/news/audit";
import { checkEditorialQuality } from "@/lib/news/quality";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "editor" && profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({})) as { status?: "draft" | "published" | "archived" };
  if (!body.status) return NextResponse.json({ error: "ต้องระบุสถานะ" }, { status: 400 });

  const { data: article } = await supabase.from("articles").select("published_at,status,title,excerpt,content,canonical_url,article_categories(category_id),article_tags(tag_id)").eq("id", id).maybeSingle();
  if (!article) return NextResponse.json({ error: "ไม่พบข่าวนี้" }, { status: 404 });

  if (body.status === "published") {
    const quality = checkEditorialQuality({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      canonicalUrl: article.canonical_url,
      categoryCount: article.article_categories?.length ?? 0,
      tagCount: article.article_tags?.length ?? 0,
    });
    if (!quality.ready) {
      return NextResponse.json({ error: "ยังเผยแพร่ไม่ได้", quality }, { status: 422 });
    }
  }

  const { error } = await supabase.from("articles").update({
    status: body.status,
    published_at: body.status === "published" ? (article.published_at ?? new Date().toISOString()) : null,
  }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const previousStatus = article.status as "draft" | "published" | "archived";
  const action = body.status === "published"
    ? "published"
    : previousStatus === "published"
      ? "unpublished"
      : body.status === "archived"
        ? "archived"
        : "updated";
  await recordArticleAudit(supabase, id, user.id, action, { previousStatus, status: body.status });
  return NextResponse.json({ ok: true });
}
