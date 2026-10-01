import { createClient } from "@/lib/supabase/server";

export type NewsArticle = {
  slug: string; title: string; excerpt: string; content: string;
  category: string; categorySlug: string; tags: string[];
  readingMinutes: number; publishedAt: string; canonicalUrl: string;
};

type ArticleRow = {
  id: string; slug: string; title: string; excerpt: string | null; content: string | null;
  canonical_url: string; published_at: string | null; reading_minutes: number | null;
  article_categories?: { category: { name: string; slug: string }[] | null }[];
  article_tags?: { tag: { name: string }[] | null }[];
};

function mapArticle(article: ArticleRow): NewsArticle {
  const category = article.article_categories?.[0]?.category?.[0];
  const tags = (article.article_tags ?? []).map((link) => link.tag?.[0]?.name)
    .filter((name): name is string => Boolean(name));
  return {
    slug: article.slug, title: article.title, excerpt: article.excerpt ?? "",
    content: article.content ?? "", category: category?.name ?? "ข่าวเด่น",
    categorySlug: category?.slug ?? "news", tags,
    readingMinutes: article.reading_minutes ?? 1,
    publishedAt: article.published_at ?? article.slug, canonicalUrl: article.canonical_url,
  };
}

const ARTICLE_SELECT = "id, slug, title, excerpt, content, canonical_url, published_at, reading_minutes, article_categories(category:categories(name, slug)), article_tags(tag:tags(name))";

export async function getNewsArticles(categorySlug?: string) {
  const supabase = await createClient();
  let query = supabase.from("articles").select(ARTICLE_SELECT).eq("status", "published").order("published_at", { ascending: false });

  if (categorySlug && categorySlug !== "all") {
    const { data: category, error } = await supabase.from("categories").select("id")
      .eq("slug", categorySlug).eq("is_active", true).maybeSingle();
    if (error) throw error;
    if (!category) return [];
    const { data: links, error: linksError } = await supabase.from("article_categories")
      .select("article_id").eq("category_id", category.id);
    if (linksError) throw linksError;
    const ids = (links ?? []).map((link) => link.article_id);
    if (!ids.length) return [];
    query = query.in("id", ids);
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as ArticleRow[]).map(mapArticle);
}

export async function getNewsArticle(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select(ARTICLE_SELECT)
    .eq("status", "published").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapArticle(data as ArticleRow) : null;
}

export async function getRelatedNews(slug: string, limit = 3) {
  const article = await getNewsArticle(slug);
  if (!article) return [];
  const supabase = await createClient();
  const { data: category, error: categoryError } = await supabase.from("categories")
    .select("id").eq("slug", article.categorySlug).maybeSingle();
  if (categoryError) throw categoryError;
  if (!category) return [];

  const { data: links, error: linksError } = await supabase.from("article_categories")
    .select("article_id").eq("category_id", category.id).limit(limit + 1);
  if (linksError) throw linksError;
  const ids = (links ?? []).map((link) => link.article_id).filter(Boolean);
  if (!ids.length) return [];

  const { data, error } = await supabase.from("articles").select(ARTICLE_SELECT)
    .eq("status", "published").neq("slug", slug).in("id", ids)
    .order("published_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return ((data ?? []) as ArticleRow[]).map(mapArticle);
}

export async function getAllTags() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("name").order("name", { ascending: true });
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((tag) => tag.name))).sort((a, b) => a.localeCompare(b, "th-TH"));
}

export async function searchNews(query: string) {
  const supabase = await createClient();
  const normalized = query.trim();
  let request = supabase.from("articles").select(ARTICLE_SELECT)
    .eq("status", "published").order("published_at", { ascending: false });
  if (normalized) {
    const escaped = normalized.replace(/[%_]/g, "\\$&");
    request = request.or("title.ilike.%" + escaped + "%,excerpt.ilike.%" + escaped + "%,content.ilike.%" + escaped + "%");
  }
  const { data, error } = await request;
  if (error) throw error;
  return ((data ?? []) as ArticleRow[]).map(mapArticle);
}


export type NewsPage = { items: NewsArticle[]; total: number; page: number; pageSize: number; totalPages: number };

export async function getNewsArticlesPage(options: { categorySlug?: string; tag?: string; page?: number; pageSize?: number } = {}): Promise<NewsPage> {
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 10));
  const page = Math.max(1, options.page ?? 1);
  const supabase = await createClient();
  let query = supabase.from("articles").select(ARTICLE_SELECT, { count: "exact" })
    .eq("status", "published").order("published_at", { ascending: false });

  if (options.categorySlug && options.categorySlug !== "all") {
    const { data: category, error } = await supabase.from("categories").select("id").eq("slug", options.categorySlug).eq("is_active", true).maybeSingle();
    if (error) throw error;
    if (!category) return { items: [], total: 0, page, pageSize, totalPages: 0 };
    const { data: links, error: linksError } = await supabase.from("article_categories").select("article_id").eq("category_id", category.id);
    if (linksError) throw linksError;
    const ids = (links ?? []).map((link) => link.article_id);
    if (!ids.length) return { items: [], total: 0, page, pageSize, totalPages: 0 };
    query = query.in("id", ids);
  }

  if (options.tag) {
    const { data: tag, error: tagError } = await supabase.from("tags").select("id").eq("slug", options.tag).maybeSingle();
    if (tagError) throw tagError;
    if (!tag) return { items: [], total: 0, page, pageSize, totalPages: 0 };
    const { data: links, error: linksError } = await supabase.from("article_tags").select("article_id").eq("tag_id", tag.id);
    if (linksError) throw linksError;
    const ids = (links ?? []).map((link) => link.article_id);
    if (!ids.length) return { items: [], total: 0, page, pageSize, totalPages: 0 };
    query = query.in("id", ids);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw error;
  const total = count ?? 0;
  return { items: ((data ?? []) as ArticleRow[]).map(mapArticle), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getPublicCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("name,slug").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getTagBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("name,slug").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}
