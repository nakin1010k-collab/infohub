import type { MetadataRoute } from "next";
import { getNewsArticles } from "@/lib/news/data";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl().origin;
  const articles = await getNewsArticles();

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
    },
    {
      url: `${baseUrl}/news`,
      changeFrequency: "daily",
    },
    ...articles.map((article) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "daily" as const,
    })),
  ];
}
