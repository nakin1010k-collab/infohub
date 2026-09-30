import type { MetadataRoute } from "next";
import { newsArticles } from "@/lib/news/mock-data";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl().origin;

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
    },
    {
      url: `${baseUrl}/news`,
      changeFrequency: "daily",
    },
    ...newsArticles.map((article) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "daily" as const,
    })),
  ];
}
