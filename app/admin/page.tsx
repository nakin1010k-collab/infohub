import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).maybeSingle();
  if (!profile || !["editor", "admin"].includes(profile.role)) redirect("/dashboard");

  const { data: articles, error } = await supabase.from("articles")
    .select("id, slug, title, status, published_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
        <section className="auth-card" aria-labelledby="admin-title">
          <div className="auth-intro">
            <p className="eyebrow">EDITORIAL CMS</p>
            <h1 id="admin-title">จัดการข่าว</h1>
            <p>สวัสดี {profile.display_name || user.email} · สิทธิ์ {profile.role}</p>
          </div>
          <div className="ui-state">
            <div>
              <strong>{error ? "โหลดรายการข่าวไม่สำเร็จ" : "มีข่าว " + (articles?.length ?? 0) + " รายการ"}</strong>
              <p>{error ? "ตรวจสอบการตั้งค่า Supabase และ migration ก่อน" : "โครง CMS และสิทธิ์ editor/admin พร้อมแล้ว ขั้นถัดไปคือฟอร์มสร้าง แก้ไข และเผยแพร่ข่าว"}</p>
            </div>
          </div>
          {!error && articles?.length ? (
            <div className="news-list">
              {articles.map((article) => (
                <article className="news-card" key={article.id}>
                  <div className="news-meta"><span className="tag">{article.status}</span><span>{article.published_at ? new Date(article.published_at).toLocaleString("th-TH") : "ยังไม่เผยแพร่"}</span></div>
                  <h2>{article.title}</h2>
                  <p className="field-hint">{article.slug}</p>
                </article>
              ))}
            </div>
          ) : null}
          <p className="auth-register"><Link href="/news">ดูหน้าเว็บข่าว</Link> · <Link href="/dashboard">กลับ Dashboard</Link></p>
        </section>
      </div>
    </main>
  );
}
