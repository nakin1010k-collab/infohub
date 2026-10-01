import { createClient } from "@/lib/supabase/server";

export type NewsArticle = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  tags: string[];
  readingMinutes: number;
  publishedAt: string;
  canonicalUrl: string;
};

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  canonical_url: string;
  published_at: string | null;
  reading_minutes: number | null;
};

type CategoryRow = {
  article_id: string;
  category: { name: string; slug: string }[] | null;
};

type TagRow = {
  article_id: string;
  tag: { name: string }[] | null;
};

async function loadPublishedArticles() {
  const supabase = await createClient();

  const [{ data: articles, error: articlesError }, { data: categoryLinks, error: categoriesError }, { data: tagLinks, error: tagsError }] =
    await Promise.all([
      supabase
        .from("articles")
        .select("id, slug, title, excerpt, content, canonical_url, published_at, reading_minutes")
        .eq("status", "published")
        .order("published_at", { ascending: false }),
      supabase
        .from("article_categories")
        .select("article_id, category:categories(name, slug)")
        .order("created_at", { ascending: true }),
      supabase
        .from("article_tags")
        .select("article_id, tag:tags(name)")
        .order("created_at", { ascending: true }),
    ]);

  if (articlesError) throw articlesError;
  if (categoriesError) throw categoriesError;
  if (tagsError) throw tagsError;

  const categoriesByArticle = new Map<string, { name: string; slug: string }>();
  for (const link of (categoryLinks ?? []) as CategoryRow[]) {
    const category = link.category?.[0];
    if (category && !categoriesByArticle.has(link.article_id)) {
      categoriesByArticle.set(link.article_id, category);
    }
  }

  const tagsByArticle = new Map<string, string[]>();
  for (const link of (tagLinks ?? []) as TagRow[]) {
    const tag = link.tag?.[0];
    if (!tag) continue;
    const tags = tagsByArticle.get(link.article_id) ?? [];
    tags.push(tag.name);
    tagsByArticle.set(link.article_id, tags);
  }

  return ((articles ?? []) as ArticleRow[]).map((article): NewsArticle => {
    const category = categoriesByArticle.get(article.id);
    return {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt ?? "",
      content: article.content ?? "",
      category: category?.name ?? "ข่าวเด่น",
      categorySlug: category?.slug ?? "news",
      tags: tagsByArticle.get(article.id) ?? [],
      readingMinutes: article.reading_minutes ?? 1,
      publishedAt: article.published_at ?? article.slug,
      canonicalUrl: article.canonical_url,
    };
  });
}

export async function getNewsArticles(categorySlug?: string) {
  const articles = await loadPublishedArticles();
  if (!categorySlug || categorySlug === "all") return articles;
  return articles.filter((article) => article.categorySlug === categorySlug);
}

export async function getNewsArticle(slug: string) {
  const articles = await loadPublishedArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}

export async function getRelatedNews(slug: string, limit = 3) {
  const articles = await loadPublishedArticles();
  const article = articles.find((item) => item.slug === slug);
  if (!article) return [];

  const sameCategory = articles.filter(
    (item) => item.slug !== slug && item.categorySlug === article.categorySlug,
  );
  const fallback = articles.filter(
    (item) => item.slug !== slug && item.categorySlug !== article.categorySlug,
  );

  return [...sameCategory, ...fallback].slice(0, limit);
}

export async function getAllTags() {
  const articles = await loadPublishedArticles();
  return Array.from(new Set(articles.flatMap((article) => article.tags))).sort((a, b) =>
    a.localeCompare(b, "th-TH"),
  );
}

export async function searchNews(query: string) {
  const articles = await loadPublishedArticles();
  const normalized = query.trim().toLocaleLowerCase("th-TH");
  if (!normalized) return articles;

  return articles.filter((article) =>
    [article.title, article.excerpt, article.content, article.category, ...article.tags]
      .join(" ")
      .toLocaleLowerCase("th-TH")
      .includes(normalized),
  );
}
