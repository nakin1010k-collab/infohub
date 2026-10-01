import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminActions from "./admin-actions";

const statusLabels: Record<string, string> = { draft: "ฉบับร่าง", published: "เผยแพร่แล้ว", archived: "เก็บถาวร" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = params.status && ["draft", "published", "archived"].includes(params.status) ? params.status : "all";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).maybeSingle();
  if (!profile || !["editor", "admin"].includes(profile.role)) redirect("/dashboard");

  let request = supabase.from("articles").select("id, slug, title, status, published_at, updated_at").order("updated_at", { ascending: false });
  if (status !== "all") request = request.eq("status", status);
  if (query) request = request.ilike("title", `%${query.replace(/[%_]/g, "\\$&")}%`);
  const { data: articles, error } = await request;

  return (
    <main className="auth-page">
      <div className="auth-shell admin-shell">
        <Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
        <section className="auth-card admin-card" aria-labelledby="admin-title">
          <div className="auth-intro">
            <div className="admin-heading-row">
              <div><p className="eyebrow">EDITORIAL CMS</p><h1 id="admin-title">จัดการข่าว</h1><p>สวัสดี {profile.display_name || user.email} · สิทธิ์ {profile.role}</p></div>
              <div className="admin-heading-actions"><Link className="state-action" href="/admin/sources">แหล่งข่าว</Link><Link className="primary-button" href="/admin/new">+ สร้างข่าวใหม่</Link></div>
            </div>
          </div>

          <form className="admin-filters" method="get">
            <input name="q" placeholder="ค้นหาจากหัวข้อข่าว…" defaultValue={query} aria-label="ค้นหาข่าว" />
            <select name="status" defaultValue={status} aria-label="กรองสถานะ">
              <option value="all">ทุกสถานะ</option><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่แล้ว</option><option value="archived">เก็บถาวร</option>
            </select>
            <button className="state-action" type="submit">กรอง</button>
            {(query || status !== "all") && <Link className="state-action" href="/admin">ล้าง</Link>}
          </form>

          <div className="ui-state">
            <div><strong>{error ? "โหลดรายการข่าวไม่สำเร็จ" : `พบข่าว ${articles?.length ?? 0} รายการ`}</strong><p>{error ? "ตรวจสอบการตั้งค่า Supabase และ migration ก่อน" : "จัดการสถานะและเปิดแก้ไขข่าวได้จากรายการนี้"}</p></div>
          </div>

          {!error && articles?.length ? <div className="news-list">{articles.map(article => (
            <article className="news-card admin-news-card" key={article.id}>
              <div className="news-meta"><span className="tag">{statusLabels[article.status] ?? article.status}</span><span>{article.updated_at ? new Date(article.updated_at).toLocaleString("th-TH") : ""}</span></div>
              <h2>{article.title}</h2>
              <p className="field-hint">{article.slug}</p>
              <AdminActions id={article.id} slug={article.slug} status={article.status} />
            </article>
          ))}</div> : !error ? <div className="ui-state"><div><strong>ยังไม่มีข่าวตามตัวกรอง</strong><p>ลองเปลี่ยนสถานะหรือสร้างข่าวใหม่</p></div></div> : null}

          <p className="auth-register"><Link href="/news">ดูหน้าเว็บข่าว</Link> · <Link href="/dashboard">กลับ Dashboard</Link></p>
        </section>
      </div>
    </main>
  );
}
