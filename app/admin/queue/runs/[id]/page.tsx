import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type FailureDetail = { url?: string; title?: string; reason?: string };

export default async function IngestionRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/queue/runs/" + encodeURIComponent(id));

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["editor", "admin"].includes(profile.role)) redirect("/dashboard");

  const { data: run, error } = await supabase.from("ingestion_runs").select("id, source_id, status, items_seen, items_created, error_message, failure_details, started_at, finished_at, source:sources(name, feed_url)").eq("id", id).maybeSingle();
  if (error) return <main className="auth-page"><div className="auth-shell admin-shell"><section className="auth-card admin-card"><div className="ui-state is-error"><div><strong>โหลดรายละเอียดรอบนำเข้าไม่สำเร็จ</strong><p>{error.message}</p></div></div><p className="auth-register"><Link href="/admin/queue">กลับคิวข่าว</Link></p></section></div></main>;
  if (!run) notFound();

  const failures: FailureDetail[] = Array.isArray(run.failure_details) ? run.failure_details : [];
  const source = Array.isArray(run.source) ? run.source[0] : run.source;
  const durationMs = run.finished_at ? Math.max(0, new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) : null;
  const duration = durationMs === null ? "กำลังทำงาน" : durationMs < 1000 ? "< 1 วินาที" : `${Math.round(durationMs / 1000)} วินาที`;
  const skipped = Math.max(0, run.items_seen - run.items_created - failures.length);

  return <main className="auth-page"><div className="auth-shell admin-shell"><Link className="auth-brand" href="/"><span className="brand-mark">🐱</span><span>InfoHub</span></Link><section className="auth-card admin-card" aria-labelledby="run-title">
    <div className="auth-intro"><div className="admin-heading-row"><div><p className="eyebrow">RSS INGESTION RUN</p><h1 id="run-title">รายละเอียดรอบนำเข้า</h1><p>{source?.name ?? "แหล่งข่าวไม่ระบุ"}</p></div><div className="admin-heading-actions"><Link className="state-action" href="/admin/sources">แหล่งข่าว</Link><Link className="primary-button" href="/admin/queue">คิวข่าว</Link></div></div></div>
    <div className="news-meta"><span className="tag">{run.status === "success" ? "สำเร็จ" : run.status === "partial" ? "สำเร็จบางส่วน" : run.status === "failed" ? "ล้มเหลว" : "กำลังทำงาน"}</span><span>เริ่ม {new Date(run.started_at).toLocaleString("th-TH")}</span>{run.finished_at ? <span>เสร็จ {new Date(run.finished_at).toLocaleString("th-TH")}</span> : null}<span>ใช้เวลา {duration}</span></div>
    <div className="queue-summary" aria-label="สรุปรอบนำเข้า"><div className="kpi-card"><span>ตรวจทั้งหมด</span><strong>{run.items_seen}</strong></div><div className="kpi-card"><span>สร้างใหม่</span><strong>{run.items_created}</strong></div><div className="kpi-card"><span>ข้าม/ซ้ำ</span><strong>{skipped}</strong></div><div className="kpi-card"><span>ล้มเหลว</span><strong>{failures.length}</strong></div></div>
    {run.error_message ? <div className="ui-state is-error"><div><strong>ข้อผิดพลาดของรอบ</strong><p>{run.error_message}</p></div></div> : null}
    <section className="admin-section" aria-labelledby="failure-title"><div className="admin-heading-row"><div><p className="eyebrow">FAILURES</p><h2 id="failure-title">รายการที่ล้มเหลว ({failures.length})</h2><p>รายละเอียด URL และสาเหตุของแต่ละรายการ</p></div></div>
      {!failures.length ? <div className="ui-state"><div><strong>ไม่มีรายการที่ล้มเหลว</strong><p>รอบนี้นำเข้าได้ครบตามข้อมูลที่อ่านจาก RSS</p></div></div> : <div className="news-list">{failures.map((failure, index) => <article className="news-card admin-news-card" key={failure.url ?? index}><h3>{failure.title || "รายการ RSS"}</h3><p>{failure.reason || "ไม่ทราบสาเหตุ"}</p>{failure.url ? <p className="field-hint"><a href={failure.url} target="_blank" rel="noreferrer">{failure.url}</a></p> : null}</article>)}</div>}
    </section><p className="auth-register"><Link href="/admin/queue">กลับคิวข่าว</Link> · <Link href="/admin/sources">กลับแหล่งข่าว</Link></p>
  </section></div></main>;
}
