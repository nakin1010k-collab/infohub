import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const started = Date.now();
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!configured) {
    return NextResponse.json({ ok: false, service: "infohub", application: "ok", database: "unconfigured", timestamp: new Date().toISOString() }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("categories").select("id").limit(1);
    if (error) {
      console.error("[health] database check failed", error);
      return NextResponse.json({ ok: false, service: "infohub", application: "ok", database: "error", timestamp: new Date().toISOString() }, { status: 503 });
    }
    return NextResponse.json({ ok: true, service: "infohub", application: "ok", database: "ok", latencyMs: Date.now() - started, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[health] database check threw", error);
    return NextResponse.json({ ok: false, service: "infohub", application: "ok", database: "error", timestamp: new Date().toISOString() }, { status: 503 });
  }
}
