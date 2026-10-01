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

export function checkEditorialQuality(input: EditorialQualityInput): EditorialQualityCheck {
  const missing: string[] = [];
  if (!input.title?.trim()) missing.push("หัวข้อ");
  if (!input.excerpt?.trim()) missing.push("คำโปรย");
  if (!input.content?.trim()) missing.push("เนื้อหา");
  if (!input.canonicalUrl?.trim()) missing.push("Canonical URL");
  if (input.categoryCount < 1) missing.push("หมวดหมู่");
  if (input.tagCount < 1) missing.push("แท็ก");

  return { ready: missing.length === 0, missing };
}
