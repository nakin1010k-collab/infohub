import { isIP } from "node:net";

export type FeedItem = {
  title: string;
  url: string;
  excerpt: string;
  publishedAt: string | null;
  authorName: string | null;
  imageUrl: string | null;
};

function decodeXml(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function textOf(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}(?:\s[^>]*)?>([\s\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function assertSafeFeedUrl(feedUrl: string) {
  const url = new URL(feedUrl);
  if (url.protocol !== "https:") throw new Error("Feed URL ต้องใช้ HTTPS");
  if (url.username || url.password) throw new Error("Feed URL ห้ามฝัง username/password");
  const hostname = url.hostname.toLowerCase();
  const ipVersion = isIP(hostname);
  const privateIpv4 = ipVersion === 4 && (
    hostname.startsWith("10.") ||
    hostname.startsWith("127.") ||
    hostname.startsWith("169.254.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
    hostname === "0.0.0.0"
  );
  const privateIpv6 = ipVersion === 6 && (
    hostname === "::1" ||
    hostname.startsWith("fe80:") ||
    hostname.startsWith("fc") ||
    hostname.startsWith("fd") ||
    hostname.startsWith("::ffff:127.")
  );
  if (privateIpv4 || privateIpv6 || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname === "metadata.google.internal") {
    throw new Error("ไม่อนุญาตให้ดึง Feed จากโฮสต์ภายในหรือ private network");
  }
  return url.toString();
}

function absoluteUrl(value: string, base: string) {
  try { return new URL(value, base).toString(); } catch { return ""; }
}

export function parseFeed(xml: string, feedUrl: string): FeedItem[] {
  const rssBlocks = [...xml.matchAll(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi)].map(m => m[0]);
  return rssBlocks.map(block => {
    const atomLink = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ?? "";
    const url = absoluteUrl(textOf(block, "link") || atomLink || textOf(block, "guid"), feedUrl);
    const rawDescription = textOf(block, "description") || textOf(block, "summary") || textOf(block, "content");
    const publishedRaw = textOf(block, "pubDate") || textOf(block, "published") || textOf(block, "updated");
    const imageMatch = block.match(/<enclosure[^>]+url=[\"']([^\"']+)[\"']/i) || block.match(/<media:(?:content|thumbnail)[^>]+url=[\"']([^\"']+)[\"']/i);
    const imageUrl = absoluteUrl(imageMatch?.[1] ?? "", feedUrl);
    const parsedDate = publishedRaw ? new Date(publishedRaw) : null;
    return {
      title: stripHtml(textOf(block, "title")),
      url,
      excerpt: stripHtml(rawDescription).slice(0, 500),
      publishedAt: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null,
      authorName: textOf(block, "author") || textOf(block, "dc:creator") || null,
      imageUrl: imageUrl || null,
    };
  }).filter(item => item.title && item.url);
}

export async function fetchFeed(feedUrl: string) {
  let currentUrl = assertSafeFeedUrl(feedUrl);
  for (let redirects = 0; redirects <= 5; redirects++) {
    const response = await fetch(currentUrl, {
      headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Feed redirect ไม่มีปลายทาง");
      currentUrl = assertSafeFeedUrl(new URL(location, currentUrl).toString());
      continue;
    }
    if (!response.ok) throw new Error(`Feed responded with HTTP ${response.status}`);
    const xml = await response.text();
    if (xml.length > 2_000_000) throw new Error("Feed is too large");
    return parseFeed(xml, currentUrl);
  }
  throw new Error("Feed redirect มากเกินไป");
}
