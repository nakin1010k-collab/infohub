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

  return <main className="auth-page"><div className="auth-shell admin-shell">
    <Link className="auth-brand" href="/"><span className="brand-mark">🐱</span><span>InfoHub</span></Link>
    <section className="auth-card admin-card">
      <div className="auth-intro"><p className="eyebrow">EDITORIAL CMS</p><h1>แหล่งข่าว</h1><p>ตั้งค่า RSS/Atom และนำเข้าข่าวเป็นฉบับร่างเพื่อรอตรวจ</p></div>
      {error ? <div className="ui-state is-error"><div><strong>โหลดแหล่งข่าวไม่สำเร็จ</strong><p>{error.message}</p></div></div> : null}
      <div className="source-list">{sources?.map(source => <article className="news-card source-card" key={source.id}>
        <div className="news-meta"><span className="tag">{source.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span><span>{source.last_ingested_at ? `นำเข้าล่าสุด ${new Date(source.last_ingested_at).toLocaleString("th-TH")}` : "ยังไม่เคยนำเข้า"}</span></div>
        <h2>{source.name}</h2><p className="field-hint">{source.domain}</p>
        <SourceForm id={source.id} feedUrl={source.feed_url} isActive={source.is_active} />
      </article>)}</div>
      <p className="auth-register"><Link href="/admin">กลับ CMS</Link> · <Link href="/news">ดูหน้าเว็บข่าว</Link></p>
    </section>
  </div></main>;
}
