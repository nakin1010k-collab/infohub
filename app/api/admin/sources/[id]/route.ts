import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "editor" && profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({})) as { feedUrl?: string; isActive?: boolean };
  let feedUrl: string | null = null;
  if (body.feedUrl?.trim()) {
    try {
      const url = new URL(body.feedUrl.trim());
      if (url.protocol !== "https:") throw new Error("Feed URL ต้องใช้ HTTPS");
      feedUrl = url.toString();
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Feed URL ไม่ถูกต้อง" }, { status: 400 });
    }
  }

  const { error } = await supabase.from("sources").update({
    feed_url: feedUrl,
    ...(typeof body.isActive === "boolean" ? { is_active: body.isActive } : {}),
  }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
