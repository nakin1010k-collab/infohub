import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SourceForm from "../source-form";

export default async function SourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/sources");
  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).maybeSingle();
  if (!profile || !["editor", "admin"].includes(profile.role)) redirect("/dashboard");
  const { data: sources, error } = await supabase.from("sources")
    .select("id, name, domain, homepage_url, feed_url, is_active, last_ingested_at")
    .order("name");
  const sourceIds = (sources ?? []).map((source) => source.id);
  const { data: latestRuns } = sourceIds.length
    ? await supabase.from("ingestion_runs").select("source_id, status, error_message, started_at, finished_at, items_seen, items_created, failure_details").in("source_id", sourceIds).order("started_at", { ascending: false })
    : { data: [] };
  const latestBySource = new Map<string, (typeof latestRuns)[number]>();
  for (const run of latestRuns ?? []) {
    if (!latestBySource.has(run.source_id)) latestBySource.set(run.source_id, run);
  }

  return <main className="auth-page"><div className="auth-shell admin-shell">
    <Link className="auth-brand" href="/"><span className="brand-mark">🐱</span><span>InfoHub</span></Link>
    <section className="auth-card admin-card">
      <div className="auth-intro"><p className="eyebrow">EDITORIAL CMS</p><h1>แหล่งข่าว</h1><p>ตั้งค่า RSS/Atom และนำเข้าข่าวเป็นฉบับร่างเพื่อรอตรวจ</p></div>
      {error ? <div className="ui-state is-error"><div><strong>โหลดแหล่งข่าวไม่สำเร็จ</strong><p>{error.message}</p></div></div> : null}
      <div className="source-list">{sources?.map(source => { const latestRun = latestBySource.get(source.id); const healthLabel = !latestRun ? "ยังไม่มีประวัติ" : latestRun.status === "failed" ? "ต้องตรวจสอบ" : latestRun.status === "partial" ? "สำเร็จบางส่วน" : latestRun.status === "running" ? "กำลังทำงาน" : "ปกติ"; return <article className="news-card source-card" key={source.id}>
        <div className="news-meta"><span className="tag">{source.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span><span className="tag">{healthLabel}</span><span>{source.last_ingested_at ? `นำเข้าล่าสุด ${new Date(source.last_ingested_at).toLocaleString("th-TH")}` : "ยังไม่เคยนำเข้า"}</span></div>
        <h2>{source.name}</h2><p className="field-hint">{source.domain}</p>{latestRun ? <p className="field-hint">รอบล่าสุด: {latestRun.items_seen} รายการ · สร้าง {latestRun.items_created} บทความ · เริ่ม {new Date(latestRun.started_at).toLocaleString("th-TH")}</p> : <p className="field-hint">ยังไม่มีรอบนำเข้า RSS</p>}{latestRun?.error_message ? <p className="field-hint">ข้อผิดพลาดล่าสุด: {latestRun.error_message}</p> : null}
        {Array.isArray(latestRun?.failure_details) && latestRun.failure_details.length ? <details className="field-hint"><summary>ดูรายการที่ล้มเหลว ({latestRun.failure_details.length})</summary><ul>{latestRun.failure_details.map((failure: { url?: string; title?: string; reason?: string }, index: number) => <li key={failure.url ?? index}><strong>{failure.title || "รายการ RSS"}</strong> — {failure.reason || "ไม่ทราบสาเหตุ"}{" "}{failure.url ? <a href={failure.url} target="_blank" rel="noreferrer">เปิดต้นทาง</a> : null}</li>)}</ul></details> : null}
        <SourceForm id={source.id} feedUrl={source.feed_url} isActive={source.is_active} retryStatus={latestRun?.status === "failed" || latestRun?.status === "partial" ? latestRun.status : null} />
      </article>; })}</div>
      <p className="auth-register"><Link href="/admin">กลับ CMS</Link> · <Link href="/news">ดูหน้าเว็บข่าว</Link></p>
    </section>
  </div></main>;
}
