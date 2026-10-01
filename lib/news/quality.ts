export type EditorialQualityInput = {
  title: string | null;
  excerpt: string | null;
  content: string | null;
  canonicalUrl: string | null;
  categoryCount: number;
  tagCount: number;
};

export type EditorialQualityCheck = {
  ready: boolean;
  missing: string[];
};

const MIN_CONTENT_LENGTH = 80;
const MIN_EXCERPT_LENGTH = 20;

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function checkEditorialQuality(input: EditorialQualityInput): EditorialQualityCheck {
  const missing: string[] = [];
  const title = input.title?.trim() ?? "";
  const excerpt = input.excerpt?.trim() ?? "";
  const content = input.content?.trim() ?? "";
  const canonicalUrl = input.canonicalUrl?.trim() ?? "";

  if (!title) missing.push("หัวข้อ");
  if (!excerpt) missing.push("คำโปรย");
  else if (excerpt.length < MIN_EXCERPT_LENGTH) missing.push("คำโปรยสั้นเกินไป");
  if (!content) missing.push("เนื้อหา");
  else if (content.length < MIN_CONTENT_LENGTH) missing.push("เนื้อหาสั้นเกินไป");
  if (!canonicalUrl) missing.push("Canonical URL");
  else if (!isValidHttpUrl(canonicalUrl)) missing.push("Canonical URL ไม่ถูกต้อง");
  if (input.categoryCount < 1) missing.push("หมวดหมู่");
  if (input.tagCount < 1) missing.push("แท็ก");

  return { ready: missing.length === 0, missing };
}
