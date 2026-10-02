import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { listAllAppwriteRows, appwriteQueries } from "@/lib/appwrite/database";

type ArticleRow = {
  slug?: string | null;
  published_at?: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().toString().replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/news`, changeFrequency: "hourly", priority: 0.9 },
  ];

  try {
    const data = await listAllAppwriteRows(
      "articles",
      [
        appwriteQueries.queryEqual("status", "published"),
        appwriteQueries.queryOrderDesc("published_at"),
      ],
      100,
    );

    return [
      ...entries,
      ...(data as ArticleRow[])
        .filter((article) => Boolean(article.slug))
        .map((article) => ({
          url: `${base}/news/${article.slug}`,
          lastModified: article.published_at ?? undefined,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
    ];
  } catch (error) {
    console.error("[sitemap] generation degraded", error);
    return entries;
  }
}
