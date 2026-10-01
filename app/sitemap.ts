import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().toString().replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/news`, changeFrequency: "hourly", priority: 0.9 },
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("articles").select("slug,published_at").eq("status", "published").order("published_at", { ascending: false });
    if (error) {
      console.error("[sitemap] article lookup failed", error);
      return entries;
    }
    return [...entries, ...(data ?? []).map((article) => ({
      url: `${base}/news/${article.slug}`,
      lastModified: article.published_at ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))];
  } catch (error) {
    console.error("[sitemap] generation degraded", error);
    return entries;
  }
}
