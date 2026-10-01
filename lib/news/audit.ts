import type { SupabaseClient } from "@supabase/supabase-js";

export type ArticleAuditAction =
  | "created"
  | "updated"
  | "ai_enriched"
  | "published"
  | "unpublished"
  | "archived"
  | "imported";

export async function recordArticleAudit(
  supabase: SupabaseClient,
  articleId: string,
  actorId: string,
  action: ArticleAuditAction,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await supabase.rpc("record_article_audit", {
    p_article_id: articleId,
    p_actor_id: actorId,
    p_action: action,
    p_metadata: metadata,
  });
  return error;
}
