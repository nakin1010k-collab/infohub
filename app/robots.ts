import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl().origin;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/dashboard", "/settings"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
