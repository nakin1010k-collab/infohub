import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const read=(path)=>readFile(path,"utf8");
const checks=[
["public news","app/news/page.tsx",["getPublicTags()","/news/"]],
["search","app/search/page.tsx",["searchPublicNews(query)","name=\"q\""]],
["detail","app/news/[slug]/page.tsx",["generateMetadata","getRelatedNews","notFound()"]],
["news data","lib/news/data.ts",["listAllAppwriteRows","getAllTags","getNewsArticlesPage"]],
["Appwrite database","lib/appwrite/database.ts",["APPWRITE_DATABASE_ID","APPWRITE_API_KEY","Query.limit"]],
["Appwrite auth","lib/appwrite/auth.ts",["getCurrentAppwriteUser","requireEditor","profiles"]],
["Appwrite request","lib/appwrite/request.ts",["X-Appwrite-Project","X-Appwrite-Session"]],
["schema contract","docs/APPWRITE_SCHEMA.md",["APPWRITE_ARTICLES_TABLE_ID","audit_logs","ingestion_runs"]],
["middleware","middleware.ts",["infohub_appwrite_session","/admin/:path*"]],
["health","app/api/health/route.ts",["Appwrite","database: \"unconfigured\""]],
["status","app/status/page.tsx",["database_not_configured","Appwrite"]],
["CMS","app/admin/page.tsx",["getAdminArticles","getCurrentEditor"]],
["article form","app/admin/article-form.tsx",["/api/admin/articles","qualityMissing"]],
["article create","app/api/admin/articles/route.ts",["createAppwriteRow","checkEditorialQuality"]],
["article update","app/api/admin/articles/[id]/route.ts",["updateAppwriteRow","createAppwriteRow"]],
["article status","app/api/admin/articles/[id]/status/route.ts",["updateAppwriteRow","checkEditorialQuality","audit_logs"]],
["AI editorial","app/api/admin/ai/enrich/route.ts",["requireEditor","recordArticleAudit"]],
["audit","lib/news/audit.ts",["createAppwriteRow","ai_enriched"]],
["profile API","app/api/profile/route.ts",["/account","displayName"]],
["login","app/login/page.tsx",["/api/auth/login"]],
["register","app/register/page.tsx",["/api/auth/register"]],
["forgot password","app/forgot-password/page.tsx",["/api/auth/forgot-password"]],
["reset password","app/reset-password/page.tsx",["/api/auth/reset-password"]],
["logout","components/sign-out-button.tsx",["/api/auth/logout"]],
["site URL","lib/site-url.ts",["NEXT_PUBLIC_SITE_URL","VERCEL_PROJECT_PRODUCTION_URL"]],
["public recovery","components/public-data-notice.tsx",["degraded"]]
];
for(const [name,path,needles] of checks){const text=await read(path);for(const needle of needles)assert.ok(text.includes(needle),"Failed: "+name+" -> "+path+" missing "+needle);}
for(const path of ["middleware.ts","app/api/health/route.ts","app/api/admin/articles/route.ts","app/api/admin/articles/[id]/route.ts","app/api/admin/articles/[id]/status/route.ts","app/api/admin/ai/enrich/route.ts","app/api/profile/route.ts","app/api/admin/ingest/route.ts","app/admin/queue/page.tsx","app/admin/queue/runs/[id]/page.tsx","app/admin/sources/page.tsx","app/api/admin/sources/[id]/route.ts"]){assert.doesNotMatch(await read(path),/supabase/i,"Supabase dependency remains in "+path);}
console.log("InfoHub Appwrite migration smoke tests passed.");
