import { NextResponse } from "next/server";
import { getAppwriteRow, listAllAppwriteRows, appwriteQueries } from "@/lib/appwrite/database";
import { requireEditor } from "@/lib/appwrite/auth";
import { recordArticleAudit } from "@/lib/news/audit";

type Suggestion = { title: string; excerpt: string; categorySlug: string; tags: string[]; readingMinutes: number };
function cleanText(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function parseJson(text: string) { const cleaned = text.replace(/^\s*```json\s*/i, "").replace(/\s*```\s*$/i, "").trim(); return JSON.parse(cleaned); }

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า OPENAI_API_KEY" }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const articleId = typeof body.articleId === "string" ? body.articleId : "";
  if (!articleId) return NextResponse.json({ error: "ต้องระบุ articleId" }, { status: 400 });
  const auth = await requireEditor();
  if (!auth.ok) return NextResponse.json({ error: auth.reason === "unauthorized" ? "ต้องเข้าสู่ระบบ" : "ไม่มีสิทธิ์ใช้งาน AI Editorial" }, { status: auth.reason === "unauthorized" ? 401 : 403 });
  const article = await getAppwriteRow("articles", articleId);
  const categories = await listAllAppwriteRows("categories", [appwriteQueries.queryEqual("is_active", true), appwriteQueries.queryOrderAsc("sort_order")]);
  if (!article) return NextResponse.json({ error: "ไม่พบบทความ" }, { status: 404 });
  const allowedCategories = categories.map((c) => String(c.slug ?? "")).filter(Boolean);
  const sourceText = [article.title, article.excerpt, article.content].filter(Boolean).join("\n\n").slice(0, 12000);
  if (!sourceText.trim()) return NextResponse.json({ error: "บทความยังไม่มีข้อความให้ AI วิเคราะห์" }, { status: 400 });
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
  const system = ["คุณเป็นผู้ช่วยกองบรรณาธิการของ InfoHub","เสนอร่างเพื่อให้บรรณาธิการตรวจ ไม่ใช่การเผยแพร่โดยอัตโนมัติ","ใช้เฉพาะข้อมูลที่มีในข้อความต้นทาง ห้ามแต่งข้อเท็จจริง ตัวเลข บุคคล หรือเหตุการณ์เพิ่ม","เขียนภาษาไทยกระชับ ชัดเจน และเป็นกลาง","categorySlug ต้องเลือกจากรายการที่ให้เท่านั้น","tags เป็นคำสั้น ๆ 2-6 คำ","readingMinutes เป็นจำนวนเต็ม 1-30"].join("\n");
  const userPrompt = ["หมวดหมู่ที่ใช้ได้: " + allowedCategories.join(", "), "", "ข้อความต้นทาง:", sourceText, "", "ตอบเป็น JSON เท่านั้นในรูปแบบ: {title, excerpt, categorySlug, tags, readingMinutes}"].join("\n");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }] }),
    cache: "no-store", signal: AbortSignal.timeout(30000),
  }).catch(() => null);
  if (!response) return NextResponse.json({ error: "เชื่อมต่อ OpenAI ไม่สำเร็จ" }, { status: 502 });
  if (!response.ok) return NextResponse.json({ error: "OpenAI ตอบกลับไม่สำเร็จ (" + response.status + ")" }, { status: 502 });
  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content;
  if (typeof raw !== "string") return NextResponse.json({ error: "OpenAI ไม่ส่งผลลัพธ์ที่อ่านได้" }, { status: 502 });
  let parsed: Partial<Suggestion>;
  try { parsed = parseJson(raw); } catch { return NextResponse.json({ error: "ผลลัพธ์จาก AI ไม่ใช่ JSON ที่ถูกต้อง" }, { status: 502 }); }
  const categorySlug = cleanText(parsed.categorySlug, 80);
  const tags = Array.isArray(parsed.tags) ? parsed.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim().slice(0, 40)).filter(Boolean).slice(0, 6) : [];
  const minutes = Number(parsed.readingMinutes);
  const sourceTitle = typeof article.title === "string" ? article.title : ""; const sourceExcerpt = typeof article.excerpt === "string" ? article.excerpt : ""; const sourceMinutes = typeof article.reading_minutes === "number" ? article.reading_minutes : Number(article.reading_minutes) || 1; const suggestion: Suggestion = { title: cleanText(parsed.title, 180) || sourceTitle, excerpt: cleanText(parsed.excerpt, 500) || sourceExcerpt, categorySlug: allowedCategories.includes(categorySlug) ? categorySlug : (allowedCategories[0] || "news"), tags, readingMinutes: Math.min(30, Math.max(1, Number.isFinite(minutes) ? Math.round(minutes) : sourceMinutes)) };
  await recordArticleAudit(articleId, auth.user.$id, "ai_enriched", { model, mode: "suggestion" });
  return NextResponse.json({ suggestion, model });
}