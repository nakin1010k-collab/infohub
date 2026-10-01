import { appwriteQueries, listAllAppwriteRows } from "@/lib/appwrite/database";
import { requireEditor } from "@/lib/appwrite/auth";

export async function getAdminArticles(status?: string, query?: string) {
  await requireEditor();
  const filters = status && status !== "all" ? [appwriteQueries.queryEqual("status", status)] : [];
  const rows = await listAllAppwriteRows("articles", filters, 100);
  const normalized = query ? rows.filter((row) => String(row.title ?? "").toLowerCase().includes(query.toLowerCase())) : rows;
  return normalized.sort((a,b)=>String(b.$updatedAt??"").localeCompare(String(a.$updatedAt??"")));
}
export async function getActiveCategories() {
  return listAllAppwriteRows("categories", [appwriteQueries.queryEqual("is_active", true), appwriteQueries.queryOrderAsc("sort_order")], 100);
}
export async function getArticleRelations(articleId: string) {
  const [article,categories,catLinks,tagLinks,tags,logs] = await Promise.all([
    import("@/lib/appwrite/database").then(m=>m.getAppwriteRow("articles",articleId)),
    getActiveCategories(),
    listAllAppwriteRows("article_categories",[appwriteQueries.queryEqual("article_id",articleId)]),
    listAllAppwriteRows("article_tags",[appwriteQueries.queryEqual("article_id",articleId)]),
    listAllAppwriteRows("tags",[],100),
    listAllAppwriteRows("audit_logs",[appwriteQueries.queryEqual("article_id",articleId),appwriteQueries.queryOrderDesc("created_at")],20),
  ]);
  return {article,categories,catLinks,tagLinks,tags,logs};
}
export async function getCurrentEditor() { return requireEditor(); }
