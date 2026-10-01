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
  const { error } = await supabase.from("article_audit_logs").insert({
    article_id: articleId,
    actor_id: actorId,
    action,
    metadata,
  });
  return error;
}
