import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEditor } from "@/lib/appwrite/admin";
import { appwriteQueries, listAllAppwriteRows } from "@/lib/appwrite/database";

export default async function AnalyticsPage() {
  const auth = await getCurrentEditor();
  if (!auth.ok) redirect(auth.reason === "unauthorized" ? "/login?next=/admin/analytics" : "/dashboard");
  let rows: { title: string; slug: string; views: number }[] = [];
  let error: Error | null = null;
  try {
    const events = await listAllAppwriteRows("analytics_events", [appwriteQueries.queryEqual("event_name", "article_view")], 500);
    const articles = await listAllAppwriteRows("articles", [], 500);
    const byId = new Map(articles.map(article => [String(article.$id), article]));
    const counts = new Map<string, { title: string; slug: string; views: number }>();
    for (const event of events) {
      const article = byId.get(String(event.article_id));
      if (!article) continue;
      const key = String(article.$id);
      const old = counts.get(key) ?? { title: String(article.title ?? ""), slug: String(article.slug ?? ""), views: 0 };
      old.views++;
      counts.set(key, old);
    }
    rows = [...counts.values()].sort((a, b) => b.views - a.views);
  } catch (e) {
    error = e instanceof Error ? e : new Error("โหลด analytics ไม่สำเร็จ");
  }
  return <main className="auth-page"><div className="auth-shell admin-shell"><section className="auth-card admin-card"><div className="admin-heading-row"><div><p className="eyebrow">ANALYTICS</p><h1>สถิติการอ่านข่าว</h1><p>นับ article view จากหน้าเว็บโดยใช้ Appwrite</p></div><Link className="state-action" href="/admin">กลับ CMS</Link></div>{error?<div className="ui-state is-error"><div><strong>โหลด analytics ไม่สำเร็จ</strong><p>{error.message}</p></div></div>:<div className="news-list">{rows.length?rows.map(row=><article className="news-card admin-news-card" key={row.slug}><div className="news-meta"><span className="tag">{row.views} views</span></div><h2><Link href={"/news/"+row.slug}>{row.title}</Link></h2></article>):<div className="ui-state"><div><strong>ยังไม่มีข้อมูล</strong><p>เมื่อมีคนเปิดข่าว ระบบจะเริ่มนับ view</p></div></div>}</div>}</section></div></main>;
}
