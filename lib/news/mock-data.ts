export type NewsArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  tags: string[];
  readingMinutes: number;
  publishedAt: string;
};

export const newsArticles: NewsArticle[] = [
  {
    slug: "infohub-demo-daily-brief",
    tags: ["ข่าวประจำวัน", "สรุปข่าว", "บริบท"],
    title: "สรุปประเด็นข่าวสำคัญประจำวัน",
    excerpt: "ต้นแบบการจัดข่าวแบบอ่านง่าย พร้อมบริบทที่ช่วยให้เห็นภาพรวมของประเด็น",
    category: "ข่าวเด่น",
    categorySlug: "news",
    readingMinutes: 5,
    publishedAt: "2026-09-30T10:30:00+07:00",
  },
  {
    slug: "technology-close-to-life",
    tags: ["เทคโนโลยี", "นวัตกรรม", "ชีวิตประจำวัน"],
    title: "เทคโนโลยีใกล้ตัวที่กำลังเปลี่ยนชีวิตเรา",
    excerpt: "ทำความเข้าใจแนวโน้มเทคโนโลยีผ่านตัวอย่างที่พบได้ในชีวิตประจำวัน",
    category: "เทคโนโลยี",
    categorySlug: "technology",
    readingMinutes: 4,
    publishedAt: "2026-09-30T09:45:00+07:00",
  },
  {
    slug: "data-story-of-the-day",
    tags: ["ข้อมูล", "สถิติ", "ตัวเลข"],
    title: "ข้อมูลใหม่ที่น่าจับตา",
    excerpt: "ต้นแบบบทความข้อมูลที่เน้นตัวเลข ข้อเท็จจริง และแหล่งที่มาอย่างเป็นระบบ",
    category: "ข้อมูล",
    categorySlug: "data",
    readingMinutes: 6,
    publishedAt: "2026-09-30T08:20:00+07:00",
  },
  {
    slug: "knowledge-explained",
    tags: ["ความรู้", "อธิบายง่าย", "ข้อมูล"],
    title: "เรื่องน่ารู้ที่อธิบายด้วยข้อมูล",
    excerpt: "เชื่อมเหตุการณ์ ข่าว และข้อมูลเพื่อช่วยให้เข้าใจเรื่องเดียวกันจากหลายมุม",
    category: "ความรู้",
    categorySlug: "knowledge",
    readingMinutes: 6,
    publishedAt: "2026-09-30T07:50:00+07:00",
  },
];

export function getRelatedNews(slug: string, limit = 3) {
  const article = newsArticles.find((item) => item.slug === slug);
  if (!article) return [];

  const sameCategory = newsArticles.filter(
    (item) => item.slug !== slug && item.categorySlug === article.categorySlug,
  );
  const fallback = newsArticles.filter(
    (item) => item.slug !== slug && item.categorySlug !== article.categorySlug,
  );

  return [...sameCategory, ...fallback].slice(0, limit);
}

export function getAllTags() {
  return Array.from(new Set(newsArticles.flatMap((article) => article.tags))).sort((a, b) =>
    a.localeCompare(b, "th-TH"),
  );
}

export function searchNews(query: string) {
  const normalized = query.trim().toLocaleLowerCase("th-TH");
  if (!normalized) return newsArticles;

  return newsArticles.filter((article) =>
    [article.title, article.excerpt, article.category, ...article.tags]
      .join(" ")
      .toLocaleLowerCase("th-TH")
      .includes(normalized),
  );
}
