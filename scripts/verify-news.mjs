import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

const news = await read("app/news/page.tsx");
const search = await read("app/search/page.tsx");
const detail = await read("app/news/[slug]/page.tsx");
const notFound = await read("app/news/[slug]/not-found.tsx");
const loading = await read("app/news/loading.tsx");
const error = await read("app/news/error.tsx");
const searchLoading = await read("app/search/loading.tsx");
const searchError = await read("app/search/error.tsx");
const data = await read("lib/news/data.ts");
const layout = await read("app/layout.tsx");
const middleware = await read("middleware.ts");
const admin = await read("app/admin/page.tsx");
const adminForm = await read("app/admin/article-form.tsx");
const adminApi = await read("app/api/admin/articles/route.ts");
const adminApiItem = await read("app/api/admin/articles/[id]/route.ts");
const adminStatusApi = await read("app/api/admin/articles/[id]/status/route.ts");
const adminActions = await read("app/admin/admin-actions.tsx");
const rss = await read("lib/news/rss.ts");
const ingest = await read("app/api/admin/ingest/route.ts");
const sources = await read("app/admin/sources/page.tsx");
const sourceForm = await read("app/admin/source-form.tsx");
const profileRoleMigration = await read("supabase/migrations/20261001000400_lock_profile_role.sql");
const sitemap = await read("app/sitemap.ts");
const robots = await read("app/robots.ts");
const signOut = await read("components/sign-out-button.tsx");
const uiStates = await read("components/ui-states.tsx");
const login = await read("app/login/page.tsx");
const register = await read("app/register/page.tsx");
const forgotPassword = await read("app/forgot-password/page.tsx");
const resetPassword = await read("app/reset-password/page.tsx");

assert.match(news, /export const metadata: Metadata/);
assert.match(news, /getAllTags\(\)/);
assert.match(news, /article\.tags\.map/);
assert.match(news, /\/search\?q=\$\{encodeURIComponent\(tag\)\}/);
assert.match(news, /\/news\/\$\{article\.slug\}/);

assert.match(search, /export const metadata: Metadata/);
assert.match(search, /robots: \{ index: false, follow: true \}/);
assert.match(search, /searchNews\(query\)/);
assert.match(search, /name="q"/);
assert.match(search, /\/news\/\$\{article\.slug\}/);

assert.match(detail, /generateMetadata/);
assert.match(detail, /notFound\(\)/);
assert.match(detail, /getRelatedNews/);
assert.match(notFound, /ไม่พบบทความ/);

assert.match(loading, /LoadingState/);
assert.match(error, /reset\(\)/);
assert.match(searchLoading, /LoadingState/);
assert.match(searchError, /reset\(\)/);

assert.match(data, /tags: string\[\]/);
assert.match(data, /getAllTags/);
assert.match(data, /mapArticle/);
assert.match(data, /\.or\(/);

assert.match(layout, /metadataBase: getSiteUrl\(\)/);
assert.match(middleware, /auth\.getClaims\(\)/);
assert.match(middleware, /\/admin\/:path\*/);
assert.match(admin, /editor/);
assert.match(admin, /profiles/);
assert.match(admin, /\/admin\/new/);
assert.match(admin, /\/admin\/\$\{article\.id\}/);
assert.match(adminForm, /\/api\/admin\/articles/);
assert.match(adminForm, /published/);
assert.match(adminApi, /article_categories/);
assert.match(adminApi, /article_tags/);
assert.match(adminApiItem, /\.update\(/);
assert.match(adminApiItem, /published_at/);
assert.match(adminStatusApi, /published_at/);
assert.match(adminStatusApi, /\.update\(/);
assert.match(adminActions, /changeStatus/);
assert.match(adminActions, /\/news\/\$\{slug\}/);
assert.match(rss, /parseFeed/);
assert.match(rss, /fetch\(feedUrl/);
assert.match(ingest, /status: "draft"/);
assert.match(ingest, /canonical_url/);
assert.match(ingest, /enrich/);
assert.match(ingest, /aiEnriched/);
assert.match(ingest, /OPENAI_API_KEY/);
assert.match(sources, /SourceForm/);
assert.match(sourceForm, /\/api\/admin\/ingest/);
assert.match(sourceForm, /aiImport/);
assert.match(sourceForm, /ช่วยจัดร่าง/);
assert.match(profileRoleMigration, /current_profile_role/);
assert.match(profileRoleMigration, /role = public\.current_profile_role/);
assert.match(sitemap, /MetadataRoute\.Sitemap/);
assert.match(robots, /MetadataRoute\.Robots/);
assert.match(signOut, /try \{/);
assert.match(signOut, /finally \{/);
assert.match(uiStates, /actionLabel=\{onRetry \? "ลองใหม่" : undefined\}/);
assert.match(uiStates, /onAction=\{onRetry\}/);

assert.match(login, /isSafeInternalPath/);
assert.match(login, /!value\.startsWith\("//")/);
assert.match(register, /name="terms" required/);
assert.match(register, /auth\.signUp/);
assert.match(forgotPassword, /resetPasswordForEmail/);
assert.match(resetPassword, /PASSWORD_RECOVERY/);
assert.match(resetPassword, /auth\.updateUser/);
assert.match(middleware, /nextPath/);

console.log("News/Search/auth hardening smoke tests passed.");

const queuePage = read("app/admin/queue/page.tsx");
assert(queuePage.includes('eq("status", "draft")'), "Editorial queue must load draft articles");
assert(queuePage.includes("/admin/queue"), "Editorial queue route must be wired");
const queueActions = read("app/admin/queue/queue-actions.tsx");
assert(queueActions.includes("/api/admin/ai/enrich"), "Editorial queue must expose AI enrichment");
assert(queueActions.includes("/api/admin/articles/"), "Editorial queue must expose publish action");

const queue = read("app/admin/queue/page.tsx");
assert(queue.includes('name="sort"'), "Editorial queue must support sorting");
assert(queue.includes("queue-summary"), "Editorial queue must show summary counts");
assert(queue.includes("ai_enriched_at"), "Editorial queue must expose AI metadata");

const auditMigration = read("supabase/migrations/20261001000700_article_audit_logs.sql");
assert(auditMigration.includes("article_audit_logs"), "Audit trail migration must exist");
const auditHelper = read("lib/news/audit.ts");
assert(auditHelper.includes("recordArticleAudit"), "Audit helper must exist");
const articleEditor = read("app/admin/[id]/page.tsx");
assert(articleEditor.includes("AUDIT TRAIL"), "Article editor must show audit trail");

const activityPage = read("app/admin/activity/page.tsx");
assert(activityPage.includes("EDITORIAL ACTIVITY"), "Editorial activity page must exist");
assert(activityPage.includes('name="action"'), "Editorial activity must filter by action");
assert(activityPage.includes('name="days"'), "Editorial activity must filter by time");

const preview = await read("app/admin/[id]/preview/page.tsx");
assert(preview.includes("EDITORIAL PREVIEW"), "Draft preview page must exist");
assert(preview.includes('["editor", "admin"]'), "Draft preview must require editorial role");
assert(queueActions.includes('"/admin/" + id + "/preview"'), "Editorial queue must use protected draft preview");
assert(admin.includes("admin-kpi-grid"), "CMS must show editorial KPI dashboard");
assert(admin.includes("publishedTodayKpi"), "CMS KPI must include today's published count");
assert(admin.includes("activityTodayKpi"), "CMS KPI must include today's activity count");
