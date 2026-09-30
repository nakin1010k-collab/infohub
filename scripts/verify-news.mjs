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
const data = await read("lib/news/mock-data.ts");
const layout = await read("app/layout.tsx");
const middleware = await read("middleware.ts");
const sitemap = await read("app/sitemap.ts");
const robots = await read("app/robots.ts");
const signOut = await read("components/sign-out-button.tsx");
const uiStates = await read("components/ui-states.tsx");
const login = await read("app/login/page.tsx");
const register = await read("app/register/page.tsx");
const forgotPassword = await read("app/forgot-password/page.tsx");
const resetPassword = await read("app/reset-password/page.tsx");

assert.match(news, /export const metadata: Metadata/);
assert.match(news, /getAllTags()/);
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
assert.match(data, /\.\.\.article\.tags/);

assert.match(layout, /metadataBase: getSiteUrl\(\)/);
assert.match(middleware, /appwriteRequest\("\/account"/);
assert.match(middleware, /matcher: \[\"\/profile\/:path\*\", \"\/dashboard\/:path\*\", \"\/settings\/:path\*\"\]/);
assert.match(sitemap, /MetadataRoute\.Sitemap/);
assert.match(robots, /MetadataRoute\.Robots/);
assert.match(signOut, /fetch\("/api\/auth\/logout"/);
assert.match(signOut, /finally \{/);
assert.match(uiStates, /actionLabel=\{onRetry \? "ลองใหม่" : undefined\}/);
assert.match(uiStates, /onAction=\{onRetry\}/);

assert.match(login, /isSafeInternalPath/);
assert.match(login, /!value\.startsWith\("\/\/"\)/);
assert.match(register, /name="terms" required/);
assert.match(register, /fetch\("/api\/auth\/register"/);
assert.match(forgotPassword, /fetch\("/api\/auth\/forgot-password"/);
assert.match(resetPassword, /fetch\("/api\/auth\/reset-password"/);
assert.match(resetPassword, /userId/);
assert.match(middleware, /nextPath/);

const loginApi = await read("app/api/auth/login/route.ts");
const registerApi = await read("app/api/auth/register/route.ts");
const logoutApi = await read("app/api/auth/logout/route.ts");
const sessionApi = await read("app/api/auth/session/route.ts");
const forgotApi = await read("app/api/auth/forgot-password/route.ts");
const resetApi = await read("app/api/auth/reset-password/route.ts");
assert.match(loginApi, /account\/sessions\/email/);
assert.match(registerApi, /\/account/);
assert.match(logoutApi, /sessions\/current/);
assert.match(sessionApi, /\/account/);
assert.match(forgotApi, /\/account\/recovery/);
assert.match(resetApi, /\/account\/recovery/);

console.log("News/Search/Appwrite auth smoke tests passed.");

const appwriteServer = await read("lib/appwrite/server.ts");
const appwriteRequest = await read("lib/appwrite/request.ts");
assert.match(appwriteServer, /httpOnly:|cookies/);
assert.match(appwriteRequest, /X-Appwrite-Project/);
assert.match(appwriteRequest, /X-Appwrite-Session/);
