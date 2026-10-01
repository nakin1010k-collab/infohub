import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QueueActions from "./queue-actions";

export default async function EditorialQueuePage({ searchParams }: { searchParams: Promise<{ origin?: string; ai?: string; sort?: string }> }) {
  const params = await searchParams;
  const origin = ["all", "rss", "manual"].includes(params.origin ?? "") ? (params.origin ?? "all") : "all";
  const ai = params.ai === "yes" ? "yes" : "all";
  const sort = params.sort === "oldest" ? "oldest" : "newest";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/queue");

  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).maybeSingle();
  if (!profile || !["editor", "admin"].includes(profile.role)) redirect("/dashboard");

  let request = supabase
    .from("articles")
    .select("id, slug, title, excerpt, status, source_id, ai_enriched_at, created_at, updated_at, published_at")
    .eq("status", "draft")
    .order("updated_at", { ascending: false });

  if (origin === "rss") request = request.not("source_id", "is", null);
  if (origin === "manual") request = request.is("source_id", null);
  if (ai === "yes") request = request.not("ai_enriched_at", "is", null);

  const { data: articles, error } = await request;
  const total = articles?.length ?? 0;
  const rssCount = articles?.filter((article) => Boolean(article.source_id)).length ?? 0;
  const manualCount = total - rssCount;
  const aiCount = articles?.filter((article) => Boolean(article.ai_enriched_at)).length ?? 0;

  return (
    <main className="auth-page">
      <div className="auth-shell admin-shell">
        <Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
        <section className="auth-card admin-card" aria-labelledby="queue-title">
          <div className="auth-intro">
            <div className="admin-heading-row">
              <div>
                <p className="eyebrow">EDITORIAL QUEUE</p>
                <h1 id="queue-title">คิวตรวจข่าว</h1>
                <p>รวมข่าวฉบับร่างที่รอตรวจ แก้ไข Preview และเผยแพร่</p>
              </div>
              <div className="admin-heading-actions">
                <Link className="state-action" href="/admin/sources">แหล่งข่าว</Link>
                <Link className="primary-button" href="/admin">CMS</Link>
              </div>
            </div>
          </div>

          <div className="ui-state">
            <div>
              <strong>{error ? "โหลดคิวข่าวไม่สำเร็จ" : "มีข่าวรอตรวจ " + (articles?.length ?? 0) + " รายการ"}</strong>
              <p>{error ? "ตรวจสอบการตั้งค่า Supabase และ migration ก่อน" : "การเผยแพร่ยังต้องผ่านการกดโดย Editor/Admin เท่านั้น"}</p>
            </div>
          </div>

          <form className="admin-filters" method="get">
            <select name="origin" defaultValue={origin} aria-label="กรองที่มา">
              <option value="all">ทุกที่มา</option>
              <option value="rss">RSS / นำเข้า</option>
              <option value="manual">เขียนเอง</option>
            </select>
            <select name="ai" defaultValue={ai} aria-label="กรอง AI">
              <option value="all">AI ทุกสถานะ</option>
              <option value="yes">AI ช่วยแล้ว</option>
            </select>
            <button className="state-action" type="submit">กรอง</button>
            {(origin !== "all" || ai !== "all" || sort !== "newest") && <Link className="state-action" href="/admin/queue">ล้าง</Link>}
          </form>

          {!error && articles?.length ? (
            <div className="news-list">
              {articles.map((article) => (
                <article className="news-card admin-news-card" key={article.id}>
                  <div className="news-meta">
                    <span className="tag">ฉบับร่าง</span>
                    <span className="tag">{article.source_id ? "RSS" : "เขียนเอง"}</span>
                    {article.ai_enriched_at ? <span className="tag">✨ AI ช่วยแล้ว</span> : null}
                    <span>แก้ไขล่าสุด {new Date(article.updated_at).toLocaleString("th-TH")}</span>
                  </div>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt || "ยังไม่มีคำโปรย"}</p>
                  <p className="field-hint">สร้างเมื่อ {new Date(article.created_at).toLocaleString("th-TH")}</p>
                  <QueueActions id={article.id} slug={article.slug} />
                </article>
              ))}
            </div>
          ) : !error ? (
            <div className="ui-state">
              <div><strong>คิวว่างแล้ว 🎉</strong><p>เมื่อมีข่าว RSS เข้ามา ข่าวจะปรากฏที่หน้านี้ในสถานะฉบับร่าง</p></div>
            </div>
          ) : null}

          <p className="auth-register"><Link href="/admin">กลับ CMS</Link> · <Link href="/news">ดูหน้าเว็บข่าว</Link></p>
        </section>
      </div>
    </main>
  );
}
