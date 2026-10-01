export type FeedItem = {
  title: string;
  url: string;
  excerpt: string;
  publishedAt: string | null;
  authorName: string | null;
};

function decodeXml(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function textOf(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
}

function absoluteUrl(value: string, base: string) {
  try { return new URL(value, base).toString(); } catch { return ""; }
}

export function parseFeed(xml: string, feedUrl: string): FeedItem[] {
  const rssBlocks = [...xml.matchAll(/<(?:item|entry)(?:\\s[^>]*)?>[\\s\\S]*?<\/(?:item|entry)>/gi)].map(m => m[0]);
  return rssBlocks.map(block => {
    const atomLink = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ?? "";
    const url = absoluteUrl(textOf(block, "link") || atomLink || textOf(block, "guid"), feedUrl);
    const rawDescription = textOf(block, "description") || textOf(block, "summary") || textOf(block, "content");
    const publishedRaw = textOf(block, "pubDate") || textOf(block, "published") || textOf(block, "updated");
    const parsedDate = publishedRaw ? new Date(publishedRaw) : null;
    return {
      title: stripHtml(textOf(block, "title")),
      url,
      excerpt: stripHtml(rawDescription).slice(0, 500),
      publishedAt: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null,
      authorName: textOf(block, "author") || textOf(block, "dc:creator") || null,
    };
  }).filter(item => item.title && item.url);
}

export async function fetchFeed(feedUrl: string) {
  const response = await fetch(feedUrl, {
    headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Feed responded with HTTP ${response.status}`);
  const xml = await response.text();
  if (xml.length > 2_000_000) throw new Error("Feed is too large");
  return parseFeed(xml, feedUrl);
}
