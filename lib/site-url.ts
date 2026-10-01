const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string) {
  return value.replace(/\/$/, "");
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    try {
      return new URL(normalizeSiteUrl(configuredUrl));
    } catch {
      // Fall through to the deployment-aware fallback.
    }
  }

  // On Vercel, use the production deployment hostname when the public URL
  // has not been configured explicitly. Preview deployments must not become
  // the canonical production URL.
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }

  return new URL(DEFAULT_SITE_URL);
}
