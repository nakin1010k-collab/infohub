import { createAppwriteRow } from "@/lib/appwrite/database";

export type ArticleAuditAction = "created"|"updated"|"ai_enriched"|"published"|"unpublished"|"archived"|"imported";

export async function recordArticleAudit(articleId: string, actorId: string, action: ArticleAuditAction, metadata: Record<string, unknown> = {}) {
  try {
    await createAppwriteRow("audit_logs", { article_id: articleId, actor_id: actorId, action, metadata: JSON.stringify(metadata) });
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error("audit write failed");
  }
}
