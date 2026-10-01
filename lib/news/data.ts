import { appwriteQueries, listAllAppwriteRows } from "@/lib/appwrite/database";

export type NewsArticle = {
  slug: string; title: string; excerpt: string; content: string;
  category: string; categorySlug: string; tags: string[];
  readingMinutes: number; publishedAt: string; canonicalUrl: string; imageUrl: string | null;
};

type Row = Record<string, any> & { $id?: string };

function rowId(row: Row) { return String(row.$id ?? row.id ?? ""); }

async function loadPublishedArticles() {
  const articles = await listAllAppwriteRows("articles", [appwriteQueries.queryEqual("status", "published"), appwriteQueries.queryOrderDesc("published_at")]);
  const categories = await listAllAppwriteRows("categories", [appwriteQueries.queryEqual("is_active", true)]);
  const links = await listAllAppwriteRows("article_categories");
  const tags = await listAllAppwriteRows("tags", [appwriteQueries.queryOrderAsc("name")]);
  const tagLinks = await listAllAppwriteRows("article_tags");

  const categoryMap = new Map(categories.map((x) => [rowId(x), x]));
  const tagMap = new Map(tags.map((x) => [rowId(x), x]));
  const categoryByArticle = new Map<string, Row>();
  for (const link of links) {
    const articleId = String(link.article_id ?? "");
    if (articleId && !categoryByArticle.has(articleId)) {
      const category = categoryMap.get(String(link.category_id ?? ""));
      if (category) categoryByArticle.set(articleId, category);
    }
  }
  const tagsByArticle = new Map<string, string[]>();
  for (const link of tagLinks) {
    const articleId = String(link.article_id ?? "");
    const tag = tagMap.get(String(link.tag_id ?? ""));
    if (!articleId || !tag) continue;
    const list = tagsByArticle.get(articleId) ?? [];
    list.push(String(tag.name ?? ""));
    tagsByArticle.set(articleId, list.filter(Boolean));
  }
  return articles.map((article) => {
    const category = categoryByArticle.get(rowId(article));
    return {
      slug: String(article.slug ?? ""), title: String(article.title ?? ""), excerpt: String(article.excerpt ?? ""),
      content: String(article.content ?? ""), category: String(category?.name ?? "ข่าวเด่น"),
      categorySlug: String(category?.slug ?? "news"), tags: tagsByArticle.get(rowId(article)) ?? [],
      readingMinutes: Number(article.reading_minutes ?? 1), publishedAt: String(article.published_at ?? ""),
      canonicalUrl: String(article.canonical_url ?? ""), imageUrl: article.image_url ? String(article.image_url) : null,
    } satisfies NewsArticle;
  });
}

export async function getNewsArticles(categorySlug?: string) {
  let items = await loadPublishedArticles();
  if (categorySlug && categorySlug !== "all") items = items.filter((article) => article.categorySlug === categorySlug);
  return items.slice(0, 50);
}

export async function getNewsArticle(slug: string) {
  return (await loadPublishedArticles()).find((article) => article.slug === slug) ?? null;
}

export async function getRelatedNews(slug: string, limit = 3) {
  const article = await getNewsArticle(slug);
  if (!article) return [];
  return (await loadPublishedArticles()).filter((x) => x.slug !== slug && x.categorySlug === article.categorySlug).slice(0, limit);
}

export async function getAllTags() {
  const rows = await listAllAppwriteRows("tags", [appwriteQueries.queryOrderAsc("name")]);
  return rows.map((row) => ({ name: String(row.name ?? ""), slug: String(row.slug ?? "") }));
}

export async function searchNews(query: string) {
  const normalized = query.trim().slice(0, 120).toLocaleLowerCase();
  const items = await loadPublishedArticles();
  if (!normalized) return items.slice(0, 50);
  return items.filter((article) => [article.title, article.excerpt, article.content].some((value) => value.toLocaleLowerCase().includes(normalized))).slice(0, 50);
}

export type NewsPage = { items: NewsArticle[]; total: number; page: number; pageSize: number; totalPages: number };

export async function getNewsArticlesPage(options: { categorySlug?: string; tag?: string; page?: number; pageSize?: number } = {}): Promise<NewsPage> {
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 10));
  const page = Math.max(1, options.page ?? 1);
  let items = await loadPublishedArticles();
  if (options.categorySlug && options.categorySlug !== "all") items = items.filter((x) => x.categorySlug === options.categorySlug);
  if (options.tag) items = items.filter((x) => x.tags.some((tag) => tag.toLowerCase() === options.tag?.toLowerCase()));
  const total = items.length;
  const from = (page - 1) * pageSize;
  return { items: items.slice(from, from + pageSize), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getPublicCategories() {
  const rows = await listAllAppwriteRows("categories", [appwriteQueries.queryEqual("is_active", true), appwriteQueries.queryOrderAsc("sort_order")]);
  return rows.map((row) => ({ name: String(row.name ?? ""), slug: String(row.slug ?? "") }));
}

export async function getTagBySlug(slug: string) {
  const rows = await listAllAppwriteRows("tags", [appwriteQueries.queryEqual("slug", slug)]);
  const row = rows[0];
  return row ? { name: String(row.name ?? ""), slug: String(row.slug ?? "") } : null;
}

export type PublicDataResult<T> = { data: T; degraded: boolean };

export async function getPublicNewsArticles(categorySlug?: string): Promise<PublicDataResult<NewsArticle[]>> {
  try { return { data: await getNewsArticles(categorySlug), degraded: false }; } catch { return { data: [], degraded: true }; }
}
export async function searchPublicNews(query: string): Promise<PublicDataResult<NewsArticle[]>> {
  try { return { data: await searchNews(query), degraded: false }; } catch { return { data: [], degraded: true }; }
}
export async function getPublicNewsArticlesPage(options: { categorySlug?: string; tag?: string; page?: number; pageSize?: number } = {}): Promise<PublicDataResult<NewsPage>> {
  try { return { data: await getNewsArticlesPage(options), degraded: false }; }
  catch {
    const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 10)); const page = Math.max(1, options.page ?? 1);
    return { data: { items: [], total: 0, page, pageSize, totalPages: 0 }, degraded: true };
  }
}
export async function getPublicTags(): Promise<PublicDataResult<{ name: string; slug: string }[]>> {
  try { return { data: await getAllTags(), degraded: false }; } catch { return { data: [], degraded: true }; }
}
