import { NextResponse } from "next/server";
import { recordArticleAudit } from "@/lib/news/audit";
import { createClient } from "@/lib/supabase/server";
import { fetchFeed } from "@/lib/news/rss";

function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100); }
async function aiEnrich(supabase: Awaited<ReturnType<typeof createClient>>, articleId: string, apiKey: string, model: string) {
  const [{ data: article }, { data: categories }] = await Promise.all([
    supabase.from("articles").select("id,title,excerpt,content,reading_minutes").eq("id", articleId).maybeSingle(),
    supabase.from("categories").select("id,name,slug").eq("is_active", true).order("sort_order"),
  ]);
  if (!article || !categories?.length) return false;
  const sourceText = [article.title, article.excerpt, article.content].filter(Boolean).join("\n\n").slice(0, 12000);
  if (!sourceText.trim()) return false;
  const allowed = categories.map((c) => c.slug);
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [
      { role: "system", content: "คุณเป็นผู้ช่วยกองบรรณาธิการ InfoHub ใช้เฉพาะข้อมูลต้นทาง ห้ามแต่งข้อเท็จจริงเพิ่ม เขียนภาษาไทยกระชับเป็นกลาง และเสนอร่างเพื่อให้บรรณาธิการตรวจเท่านั้น" },
      { role: "user", content: "หมวดที่ใช้ได้: " + allowed.join(", ") + "\n\nต้นทาง:\n" + sourceText + "\n\nตอบ JSON: {title,excerpt,categorySlug,tags,readingMinutes}" },
    ] }), cache: "no-store", signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) return false;
  const payload = await response.json(); const raw = payload?.choices?.[0]?.message?.content;
  if (typeof raw !== "string") return false;
  let parsed: any; try { parsed = JSON.parse(raw); } catch { return false; }
  const category = categories.find((c) => c.slug === parsed.categorySlug) ?? categories[0];
  const tags = Array.isArray(parsed.tags) ? parsed.tags.filter((x: unknown): x is string => typeof x === "string").map((x: string) => x.trim().slice(0, 40)).filter(Boolean).slice(0, 6) : [];
  const minutes = Number(parsed.readingMinutes);
  const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim().slice(0, 180) : article.title;
  const excerpt = typeof parsed.excerpt === "string" ? parsed.excerpt.trim().slice(0, 500) : article.excerpt;
  const { error } = await supabase.from("articles").update({ title, excerpt: excerpt || null, reading_minutes: Math.min(30, Math.max(1, Number.isFinite(minutes) ? Math.round(minutes) : (article.reading_minutes || 1))) }).eq("id", articleId);
  if (error) return false;
  await supabase.from("article_categories").delete().eq("article_id", articleId);
  await supabase.from("article_categories").insert({ article_id: articleId, category_id: category.id });
  for (const tag of tags) {
    const slug = slugify(tag); if (!slug) continue;
    const { data: existing } = await supabase.from("tags").select("id").eq("slug", slug).maybeSingle();
    const tagId = existing?.id ?? (await supabase.from("tags").insert({ name: tag, slug }).select("id").single()).data?.id;
    if (tagId) await supabase.from("article_tags").upsert({ article_id: articleId, tag_id: tagId }, { onConflict: "article_id,tag_id" });
  }
  return true;
}

export async function POST(request: Request) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "editor" && profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { sourceId?: string; enrich?: boolean };
  if (!body.sourceId) return NextResponse.json({ error: "ต้องระบุ sourceId" }, { status: 400 });
  const { data: source, error: sourceError } = await supabase.from("sources").select("id,name,feed_url,is_active").eq("id", body.sourceId).maybeSingle();
  if (sourceError) return NextResponse.json({ error: sourceError.message }, { status: 400 });
  if (!source?.is_active || !source.feed_url) return NextResponse.json({ error: "แหล่งข่าวนี้ยังไม่มี feed URL หรือถูกปิดใช้งาน" }, { status: 400 });
  const { data: run, error: runError } = await supabase.from("ingestion_runs").insert({ source_id: source.id, status: "running" }).select("id").single();
  if (runError) return NextResponse.json({ error: runError.message }, { status: 400 });
  try {
    const items = await fetchFeed(source.feed_url); let created = 0; let aiEnriched = 0;
    for (const item of items.slice(0, 50)) {
      const { data: existing } = await supabase.from("articles").select("id").eq("canonical_url", item.url).maybeSingle(); if (existing) continue;
      const baseSlug = slugify(item.title) || "imported-" + Date.now(); const slug = baseSlug + "-" + crypto.randomUUID().slice(0, 8);
      const { data: inserted, error } = await supabase.from("articles").insert({ slug, title: item.title, excerpt: item.excerpt || null, content: item.excerpt || null, canonical_url: item.url, source_id: source.id, author_name: item.authorName, published_at: item.publishedAt, status: "draft", reading_minutes: Math.max(1, Math.ceil((item.excerpt || item.title).length / 600)), ai_enriched_at: null }).select("id").single();
      if (!error && inserted) { created++; await recordArticleAudit(supabase, inserted.id, user.id, "imported", { sourceId: source.id, sourceName: source.name, canonicalUrl: item.url }); if (body.enrich && process.env.OPENAI_API_KEY) { if (await aiEnrich(supabase, inserted.id, process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL?.trim() || "gpt-5-mini")) { aiEnriched++; await supabase.from("articles").update({ ai_enriched_at: new Date().toISOString() }).eq("id", inserted.id); } } }
    }
    await supabase.from("ingestion_runs").update({ status: "success", items_seen: items.length, items_created: created, finished_at: new Date().toISOString() }).eq("id", run.id);
    await supabase.from("sources").update({ last_ingested_at: new Date().toISOString() }).eq("id", source.id);
    return NextResponse.json({ ok: true, source: source.name, itemsSeen: items.length, itemsCreated: created, aiEnriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingestion error";
    await supabase.from("ingestion_runs").update({ status: "failed", error_message: message.slice(0, 500), finished_at: new Date().toISOString() }).eq("id", run.id);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}