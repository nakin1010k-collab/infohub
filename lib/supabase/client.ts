import { createBrowserClient } from "@supabase/ssr";

export class SupabaseBrowserConfigError extends Error {
  readonly code = "SUPABASE_BROWSER_CONFIG_MISSING";

  constructor() {
    super("Supabase browser environment variables are not configured.");
    this.name = "SupabaseBrowserConfigError";
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new SupabaseBrowserConfigError();
  }

  return createBrowserClient(url, key);
}
