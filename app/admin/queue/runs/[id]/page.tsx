import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ItemDetail = { url?: string; title?: string; outcome?: "created" | "duplicate" | "failed"; reason?: string };
const PAGE_SIZE = 10;

export default async function IngestionRunPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ filter?: string; page?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const filter = ["all", "created", "duplicate", "failed"].includes(query.filter ?? "") ? (query.filter ?? "all") : "all";
  const pageNumber = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/queue/runs/" + encodeURIComponent(id));
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["editor", "admin"].includes(profile.role)) redirect("/dashboard");
  const { data: run, error } = await supabase.from("ingestion_runs").select("id, source_id, status, items_seen, items_created, items_skipped, items_failed, error_message, item_details, started_at, finished_at, source:sources(name, feed_url)").eq("id", id).maybeSingle();
  if (error) return <main className="auth-page"><div className="auth-shell admin-shell"><section className="auth-card admin-card"><div className="ui-state is-error"><div><strong>โหลดรายละเอียดรอบนำเข้าไม่สำเร็จ</strong><p>{error.message}</p></div></div><p className="auth-register"><Link href="/admin/queue">กลับคิวข่าว</Link></p></section></div></main>;
  if (!run) notFound();
  const allItems: ItemDetail[] = Array.isArray(run.item_details) ? run.item_details : [];
  const items = filter === "all" ? allItems : allItems.filter((item) => item.outcome === filter);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(pageNumber, totalPages);
  const visibleItems = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const counts = { all: allItems.length, created: allItems.filter((x) => x.outcome === "created").length, duplicate: allItems.filter((x) => x.outcome === "duplicate").length, failed: allItems.filter((x) => x.outcome === "failed").length };
  const skippedCount = typeof run.items_skipped === "number" ? run.items_skipped : counts.duplicate;
  const failedCount = typeof run.items_failed === "number" ? run.items_failed : counts.failed;
  const source = Array.isArray(run.source) ? run.source[0] : run.source;
  const durationMs = run.finished_at ? Math.max(0, new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) : null;
  const duration = durationMs === null ? "กำลังทำงาน" : durationMs < 1000 ? "< 1 วินาที" : `${Math.round(durationMs / 1000)} วินาที`;
  const linkFor = (nextPage: number) => `/admin/queue/runs/${run.id}?filter=${filter}&page=${nextPage}`;

  return <main className="auth-page"><div className="auth-shell admin-shell"><Link className="auth-brand" href="/"><span className="brand-mark">🐱</span><span>InfoHub</span></Link><section className="auth-card admin-card" aria-labelledby="run-title">
    <div className="auth-intro"><div className="admin-heading-row"><div><p className="eyebrow">RSS INGESTION RUN</p><h1 id="run-title">รายละเอียดรอบนำเข้า</h1><p>{source?.name ?? "แหล่งข่าวไม่ระบุ"}</p></div><div className="admin-heading-actions"><Link className="state-action" href="/admin/sources">แหล่งข่าว</Link><Link className="primary-button" href="/admin/queue">คิวข่าว</Link></div></div></div>
    <div className="news-meta"><span className="tag">{run.status === "success" ? "สำเร็จ" : run.status === "partial" ? "สำเร็จบางส่วน" : run.status === "failed" ? "ล้มเหลว" : "กำลังทำงาน"}</span><span>เริ่ม {new Date(run.started_at).toLocaleString("th-TH")}</span>{run.finished_at ? <span>เสร็จ {new Date(run.finished_at).toLocaleString("th-TH")}</span> : null}<span>ใช้เวลา {duration}</span></div>
    <div className="queue-summary" aria-label="สรุปรอบนำเข้า"><div className="kpi-card"><span>ตรวจทั้งหมด</span><strong>{run.items_seen}</strong></div><div className="kpi-card"><span>สร้างใหม่</span><strong>{run.items_created}</strong></div><div className="kpi-card"><span>ข้าม/ซ้ำ</span><strong>{skippedCount}</strong></div><div className="kpi-card"><span>ล้มเหลว</span><strong>{failedCount}</strong></div></div>
    {run.error_message ? <div className="ui-state is-error"><div><strong>ข้อผิดพลาดของรอบ</strong><p>{run.error_message}</p></div></div> : null}
    <section className="admin-section" aria-labelledby="items-title"><div className="admin-heading-row"><div><p className="eyebrow">ITEMS</p><h2 id="items-title">รายการจาก RSS</h2><p>เลือกประเภทและเปิดดูรายละเอียดทีละรายการ</p></div></div>
      <nav className="admin-filters" aria-label="กรองผลลัพธ์"><Link className={filter === "all" ? "primary-button" : "state-action"} href={`/admin/queue/runs/${run.id}?filter=all&page=1`}>ทั้งหมด ({counts.all})</Link><Link className={filter === "created" ? "primary-button" : "state-action"} href={`/admin/queue/runs/${run.id}?filter=created&page=1`}>สร้างใหม่ ({counts.created})</Link><Link className={filter === "duplicate" ? "primary-button" : "state-action"} href={`/admin/queue/runs/${run.id}?filter=duplicate&page=1`}>Duplicate ({counts.duplicate})</Link><Link className={filter === "failed" ? "primary-button" : "state-action"} href={`/admin/queue/runs/${run.id}?filter=failed&page=1`}>ล้มเหลว ({counts.failed})</Link></nav>
      {!allItems.length ? <div className="ui-state"><div><strong>รอบนี้ยังไม่มีรายละเอียดรายการ</strong><p>ข้อมูลรายละเอียดจะเริ่มเก็บตั้งแต่รอบนำเข้าที่สร้างหลังเปิดใช้ระบบนี้</p></div></div> : !visibleItems.length ? <div className="ui-state"><div><strong>ไม่พบรายการในตัวกรองนี้</strong></div></div> : <div className="news-list">{visibleItems.map((item, index) => <article className="news-card admin-news-card" key={`${item.url ?? "item"}-${index}`}><div className="news-meta"><span className="tag">{item.outcome === "created" ? "สร้างใหม่" : item.outcome === "duplicate" ? "Duplicate" : "ล้มเหลว"}</span></div><h3>{item.title || "รายการ RSS"}</h3>{item.reason ? <p>{item.reason}</p> : <p className="field-hint">ไม่มีข้อผิดพลาด</p>}{item.url ? <p className="field-hint"><a href={item.url} target="_blank" rel="noreferrer">{item.url}</a></p> : null}</article>)}</div>}
      {totalPages > 1 ? <div className="admin-actions"><span className="field-hint">หน้า {safePage} / {totalPages}</span>{safePage > 1 ? <Link className="state-action" href={linkFor(safePage - 1)}>← ก่อนหน้า</Link> : null}{safePage < totalPages ? <Link className="state-action" href={linkFor(safePage + 1)}>ถัดไป →</Link> : null}</div> : null}
    </section><p className="auth-register"><Link href="/admin/queue">กลับคิวข่าว</Link> · <Link href="/admin/sources">กลับแหล่งข่าว</Link></p>
  </section></div></main>;
}