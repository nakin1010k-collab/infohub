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

assert.match(news, /export const metadata: Metadata/);
assert.match(news, /getAllTags\(\)/);
assert.match(news, /article\.tags\.map/);
assert.match(news, /\/news\/\$\{article\.slug\}/);

assert.match(search, /export const metadata: Metadata/);
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
assert.match(data, /searchNews/);

console.log("News/Search smoke tests passed.");
