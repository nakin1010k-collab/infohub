type Category = { id: string; name: string; slug: string };

const RULES: Array<{ slug: string; keywords: string[] }> = [
  { slug: "technology", keywords: ["ai", "artificial intelligence", "เทคโนโลยี", "เทค", "แอป", "ซอฟต์แวร์", "ดิจิทัล", "มือถือ", "คอมพิวเตอร์", "อินเทอร์เน็ต"] },
  { slug: "data", keywords: ["ข้อมูล", "สถิติ", "ตัวเลข", "สำรวจ", "เปอร์เซ็นต์", "data", "statistics", "dataset"] },
  { slug: "knowledge", keywords: ["วิธี", "อธิบาย", "ความรู้", "ทำไม", "คืออะไร", "science", "วิทยาศาสตร์", "เรียนรู้"] },
  { slug: "news", keywords: [] },
];

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function enrichWithoutAI(article: {
  title: string;
  excerpt: string | null;
  content: string | null;
  readingMinutes: number | null;
}, categories: Category[]) {
  const text = [article.title, article.excerpt, article.content].filter(Boolean).join(" ").toLowerCase();
  const matched = RULES
    .map((rule) => ({ rule, score: rule.keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score)[0];

  const category = categories.find((item) => item.slug === matched?.rule.slug)
    ?? categories.find((item) => item.slug === "news")
    ?? categories[0];

  const tagCandidates = RULES
    .filter((rule) => rule.slug !== category?.slug)
    .flatMap((rule) => rule.keywords.filter((keyword) => text.includes(keyword)))
    .slice(0, 4);

  const tags = Array.from(new Set([category?.name ?? "ข่าว", ...tagCandidates]))
    .map((name) => ({ name: name.slice(0, 40), slug: slugify(name) }))
    .filter((tag) => tag.slug)
    .slice(0, 5);

  const readingMinutes = Math.min(
    30,
    Math.max(1, article.readingMinutes || Math.ceil(([article.title, article.excerpt, article.content].filter(Boolean).join(" ").length) / 600)),
  );

  return { category, tags, readingMinutes };
}
