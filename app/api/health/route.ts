import { NextResponse } from "next/server";
import { appwriteRequest, getAppwriteError } from "@/lib/appwrite/request";

export async function GET() {
  const started = Date.now();
  const configured = Boolean(
    process.env.APPWRITE_DATABASE_ID &&
      process.env.APPWRITE_ARTICLES_TABLE_ID &&
      process.env.APPWRITE_API_KEY,
  );

  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        service: "infohub",
        application: "ok",
        database: "unconfigured",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  try {
    const response = await appwriteRequest(
      "/tablesdb/" +
        encodeURIComponent(process.env.APPWRITE_DATABASE_ID!) +
        "/tables/" +
        encodeURIComponent(process.env.APPWRITE_ARTICLES_TABLE_ID!) +
        "/rows?queries[]=" +
        encodeURIComponent("Query.limit(1)"),
      { method: "GET" },
      undefined,
      process.env.APPWRITE_API_KEY,
    );

    if (!response.ok) {
      const error = await getAppwriteError(response);
      console.error("[health] Appwrite database check failed", error);
      return NextResponse.json(
        {
          ok: false,
          service: "infohub",
          application: "ok",
          database: "error",
          diagnostic: {
            status: response.status,
            code: error.code,
            type: error.type || undefined,
            message: error.message || undefined,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      service: "infohub",
      application: "ok",
      database: "ok",
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] Appwrite check failed", error);
    return NextResponse.json(
      {
        ok: false,
        service: "infohub",
        application: "ok",
        database: "error",
        diagnostic: {
          type: "network_error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
