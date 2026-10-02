#!/usr/bin/env node

const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1").replace(/\/$/, "");
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6abd3aa6000db661c656";
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || "infohub";

if (!apiKey) throw new Error("APPWRITE_API_KEY is required.");

const tables = {
  categories: "categories",
  articles: "articles",
  article_categories: "article_categories",
  tags: "tags",
  article_tags: "article_tags",
};

async function request(path, options = {}) {
  const response = await fetch(endpoint + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
      ...(options.headers || {}),
    },
  });
  let body = null;
  try { body = await response.json(); } catch {}
  if (!response.ok) {
    throw new Error(body?.message || `Appwrite request failed: ${response.status} ${path}`);
  }
  return body;
}

async function list(tableId) {
  const path = `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows?queries[]=${encodeURIComponent(JSON.stringify({method:"limit",values:[100]}))}`;
  return (await request(path)).rows || [];
}

async function create(tableId, data) {
  return request(`/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows`, {
    method: "POST",
    body: JSON.stringify({ rowId: "unique()", data }),
  });
}

async function upsertBy(tableId, field, value, data) {
  const rows = await list(tableId);
  const found = rows.find((row) => String(row[field] ?? "") === String(value));
  if (found) return found;
  return create(tableId, data);
}

const categories = [
  { name: "ข่าวเด่น", slug: "news", is_active: true, sort_order: 1 },
  { name: "เทคโนโลยี", slug: "technology", is_active: true, sort_order: 2 },
  { name: "ข้อมูล", slug: "data", is_active: true, sort_order: 3 },
  { name: "ความรู้", slug: "knowledge", is_active: true, sort_order: 4 },
];

const tags = [
  { name: "เทคโนโลยี", slug: "technology" },
  { name: "AI", slug: "ai" },
  { name: "ดิจิทัล", slug: "digital" },
  { name: "ความรู้", slug: "knowledge" },
  { name: "ธุรกิจ", slug: "business" },
  { name: "ข้อมูล", slug: "data" },
];

const articles = [
  {
    title: "AI กับการเปลี่ยนแปลงวิธีทำงานในยุคดิจิทัล",
    slug: "ai-and-the-future-of-digital-work",
    excerpt: "สำรวจบทบาทของ AI ในการช่วยวิเคราะห์ข้อมูล สร้างเนื้อหา และเพิ่มประสิทธิภาพการทำงานขององค์กร",
    content: "AI กำลังเข้ามามีบทบาทในกระบวนการทำงานหลากหลายรูปแบบ ตั้งแต่การค้นคว้าข้อมูล การสรุปเอกสาร ไปจนถึงการช่วยสร้างต้นแบบผลิตภัณฑ์\n\nการนำ AI มาใช้ให้เกิดประโยชน์ควรเริ่มจากปัญหาที่ต้องการแก้ กำหนดข้อมูลที่จำเป็น และตรวจสอบผลลัพธ์ก่อนนำไปใช้งานจริง",
    status: "published",
    canonical_url: "https://infohub-ten.vercel.app/news/ai-and-the-future-of-digital-work",
    canonical_url_hash: "demo-ai-future-work",
    reading_minutes: 3,
    published_at: "2026-10-01T08:00:00.000Z",
    image_url: null,
  },
  {
    title: "5 แนวทางจัดการข้อมูลให้พร้อมใช้ในองค์กร",
    slug: "five-ways-to-make-business-data-ready",
    excerpt: "แนวทางพื้นฐานในการจัดระเบียบข้อมูล ตั้งชื่อฟิลด์ และกำหนดเจ้าของข้อมูล เพื่อให้ทีมทำงานร่วมกันได้ง่ายขึ้น",
    content: "ข้อมูลที่ดีไม่ได้หมายถึงข้อมูลจำนวนมาก แต่หมายถึงข้อมูลที่ค้นหา เข้าใจ และนำไปใช้ต่อได้\n\nองค์กรสามารถเริ่มจากการกำหนดโครงสร้างข้อมูลกลาง สร้างมาตรฐานการตั้งชื่อ และกำหนดผู้รับผิดชอบข้อมูลแต่ละชุด",
    status: "published",
    canonical_url: "https://infohub-ten.vercel.app/news/five-ways-to-make-business-data-ready",
    canonical_url_hash: "demo-data-ready",
    reading_minutes: 4,
    published_at: "2026-09-30T08:00:00.000Z",
    image_url: null,
  },
  {
    title: "ทำไมเว็บไซต์ความรู้ควรมี Search และระบบ Tags",
    slug: "why-knowledge-sites-need-search-and-tags",
    excerpt: "Search และ Tags ช่วยให้ผู้ใช้งานค้นพบเนื้อหาที่เกี่ยวข้องได้เร็วขึ้น และช่วยให้แพลตฟอร์มจัดการคลังความรู้ขนาดใหญ่ได้ง่าย",
    content: "เมื่อจำนวนบทความเพิ่มขึ้น การจัดหมวดหมู่เพียงอย่างเดียวอาจไม่เพียงพอ ระบบ Search และ Tags ช่วยเชื่อมโยงเนื้อหาที่มีหัวข้อใกล้เคียงกัน\n\nสำหรับแพลตฟอร์มข่าวหรือความรู้ การออกแบบ metadata ตั้งแต่ต้นจึงช่วยลดภาระในการจัดการเนื้อหาในระยะยาว",
    status: "published",
    canonical_url: "https://infohub-ten.vercel.app/news/why-knowledge-sites-need-search-and-tags",
    canonical_url_hash: "demo-search-tags",
    reading_minutes: 3,
    published_at: "2026-09-29T08:00:00.000Z",
    image_url: null,
  },
];

const articleTagNames = [
  ["ai-and-the-future-of-digital-work", ["AI", "เทคโนโลยี", "ดิจิทัล"]],
  ["five-ways-to-make-business-data-ready", ["ข้อมูล", "ธุรกิจ", "ความรู้"]],
  ["why-knowledge-sites-need-search-and-tags", ["ความรู้", "ดิจิทัล", "ข้อมูล"]],
];

const articleCategorySlugs = {
  "ai-and-the-future-of-digital-work": "technology",
  "five-ways-to-make-business-data-ready": "data",
  "why-knowledge-sites-need-search-and-tags": "knowledge",
};

const categoryRows = {};
for (const item of categories) {
  const row = await upsertBy(tables.categories, "slug", item.slug, item);
  categoryRows[item.slug] = row.$id;
  console.log(`category: ${item.slug}`);
}

const tagRows = {};
for (const item of tags) {
  const row = await upsertBy(tables.tags, "slug", item.slug, item);
  tagRows[item.slug] = row.$id;
  console.log(`tag: ${item.slug}`);
}

const articleRows = {};
for (const item of articles) {
  const row = await upsertBy(tables.articles, "slug", item.slug, item);
  articleRows[item.slug] = row.$id;
  console.log(`article: ${item.slug}`);
}

for (const [slug, categorySlug] of Object.entries(articleCategorySlugs)) {
  const rows = await list(tables.article_categories);
  const exists = rows.some((row) => String(row.article_id) === String(articleRows[slug]) && String(row.category_id) === String(categoryRows[categorySlug]));
  if (!exists) await create(tables.article_categories, { article_id: articleRows[slug], category_id: categoryRows[categorySlug] });
}

for (const [slug, names] of articleTagNames) {
  const rows = await list(tables.article_tags);
  for (const name of names) {
    const tag = tags.find((item) => item.name === name);
    const exists = rows.some((row) => String(row.article_id) === String(articleRows[slug]) && String(row.tag_id) === String(tagRows[tag.slug]));
    if (!exists) await create(tables.article_tags, { article_id: articleRows[slug], tag_id: tagRows[tag.slug] });
  }
}

console.log("InfoHub demo seed completed.");
