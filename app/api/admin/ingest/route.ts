import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchFeed } from "@/lib/news/rss";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "editor" && profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({})) as { sourceId?: string };
  if (!body.sourceId) return NextResponse.json({ error: "ต้องระบุ sourceId" }, { status: 400 });

  const { data: source, error: sourceError } = await supabase.from("sources")
    .select("id, name, feed_url, is_active").eq("id", body.sourceId).maybeSingle();
  if (sourceError) return NextResponse.json({ error: sourceError.message }, { status: 400 });
  if (!source?.is_active || !source.feed_url) return NextResponse.json({ error: "แหล่งข่าวนี้ยังไม่มี feed URL หรือถูกปิดใช้งาน" }, { status: 400 });

  const { data: run, error: runError } = await supabase.from("ingestion_runs")
    .insert({ source_id: source.id, status: "running" }).select("id").single();
  if (runError) return NextResponse.json({ error: runError.message }, { status: 400 });

  try {
    const items = await fetchFeed(source.feed_url);
    let created = 0;
    for (const item of items.slice(0, 50)) {
      const { data: existing } = await supabase.from("articles").select("id").eq("canonical_url", item.url).maybeSingle();
      if (existing) continue;
      const baseSlug = slugify(item.title) || `imported-${Date.now()}`;
      const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
      const { error } = await supabase.from("articles").insert({
        slug,
        title: item.title,
        excerpt: item.excerpt || null,
        content: item.excerpt || null,
        canonical_url: item.url,
        source_id: source.id,
        author_name: item.authorName,
        published_at: item.publishedAt,
        status: "draft",
        reading_minutes: Math.max(1, Math.ceil((item.excerpt || item.title).length / 600)),
      });
      if (!error) created++;
    }

    await supabase.from("ingestion_runs").update({
      status: "success", items_seen: items.length, items_created: created, finished_at: new Date().toISOString()
    }).eq("id", run.id);
    await supabase.from("sources").update({ last_ingested_at: new Date().toISOString() }).eq("id", source.id);

    return NextResponse.json({ ok: true, source: source.name, itemsSeen: items.length, itemsCreated: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingestion error";
    await supabase.from("ingestion_runs").update({
      status: "failed", error_message: message.slice(0, 500), finished_at: new Date().toISOString()
    }).eq("id", run.id);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
