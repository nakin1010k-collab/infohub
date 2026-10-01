const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string) {
  return value.replace(/\/$/, "");
}

function parseSiteUrl(value: string) {
  try {
    const url = new URL(normalizeSiteUrl(value));
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return null;
    return url;
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) {
    const parsed = parseSiteUrl(configuredUrl);
    if (parsed) return parsed;
  }

  if (process.env.VERCEL_ENV === "production") {
    const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    const parsed = productionUrl ? parseSiteUrl(`https://${productionUrl}`) : null;
    if (parsed) return parsed;

    const deploymentUrl = process.env.VERCEL_URL?.trim();
    const deploymentParsed = deploymentUrl ? parseSiteUrl(`https://${deploymentUrl}`) : null;
    if (deploymentParsed) return deploymentParsed;
  }

  return new URL(DEFAULT_SITE_URL);
}
