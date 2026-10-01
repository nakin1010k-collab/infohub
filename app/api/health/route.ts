import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const started = Date.now();

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("categories").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          service: "infohub",
          database: "error",
          message: error.message,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      service: "infohub",
      database: "ok",
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "infohub",
        database: "unconfigured",
        message: error instanceof Error ? error.message : "Database health check failed",
      },
      { status: 503 },
    );
  }
}
