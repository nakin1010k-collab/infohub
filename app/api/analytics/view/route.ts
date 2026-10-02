import { NextResponse } from "next/server";
import { appwriteQueries, createAppwriteRow, listAllAppwriteRows } from "@/lib/appwrite/database";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return NextResponse.json({ ok: false }, { status: 415 });
  const body = await request.json().catch(() => ({})) as { slug?: string };
  const slug = body.slug?.trim();
  if (!slug || slug.length > 160) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const articles = await listAllAppwriteRows("articles", [appwriteQueries.queryEqual("slug", slug), appwriteQueries.queryEqual("status", "published")], 1);
    const article = articles[0];
    if (!article?.$id) return NextResponse.json({ ok: false }, { status: 404 });

    const path = "/news/" + slug;
    const cutoff = Date.now() - 30_000;
    const recent = await listAllAppwriteRows("analytics_events", [
      appwriteQueries.queryEqual("event_name", "article_view"),
      appwriteQueries.queryEqual("article_id", article.$id),
      appwriteQueries.queryEqual("path", path),
    ], 100);
    if (recent.some(event => Date.parse(String(event.created_at ?? "")) >= cutoff)) {
      return NextResponse.json({ ok: true, deduplicated: true });
    }

    await createAppwriteRow("analytics_events", {
      event_name: "article_view",
      article_id: article.$id,
      path,
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[analytics/view] failed", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
