import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminArticles, getCurrentEditor } from "@/lib/appwrite/admin";
import AdminActions from "./admin-actions";

const statusLabels: Record<string,string> = {draft:"ฉบับร่าง",published:"เผยแพร่แล้ว",archived:"เก็บถาวร"};

export default async function AdminPage({searchParams}:{searchParams:Promise<{q?:string;status?:string}>}) {
 const params=await searchParams; const query=params.q?.trim()??""; const status=["draft","published","archived"].includes(params.status??"")?params.status:"all";
 const auth=await getCurrentEditor(); if(!auth.ok) redirect(auth.reason==="unauthorized"?"/login?next=/admin":"/dashboard");
 const articles=await getAdminArticles(status,query);
 const drafts=articles.filter(x=>x.status==="draft").length, published=articles.filter(x=>x.status==="published").length, archived=articles.filter(x=>x.status==="archived").length;
 return <main className="auth-page"><div className="auth-shell admin-shell"><Link className="auth-brand" href="/"><span className="brand-mark">🐱</span><span>InfoHub</span></Link><section className="auth-card admin-card">
  <div className="auth-intro"><div className="admin-heading-row"><div><p className="eyebrow">EDITORIAL CMS</p><h1>จัดการข่าว</h1><p>สวัสดี {auth.profile?.display_name || auth.user.name || auth.user.email} · สิทธิ์ {auth.profile?.role}</p></div><div className="admin-heading-actions"><Link className="state-action" href="/admin/activity">กิจกรรม</Link><Link className="state-action" href="/admin/queue">คิวตรวจข่าว</Link><Link className="state-action" href="/admin/sources">แหล่งข่าว</Link><Link className="primary-button" href="/admin/new">+ สร้างข่าวใหม่</Link></div></div></div>
  <div className="admin-kpi-grid">{[{label:"ทั้งหมด",value:articles.length},{label:"รอตรวจ",value:drafts},{label:"เผยแพร่แล้ว",value:published},{label:"เก็บถาวร",value:archived}].map(x=><div className="admin-kpi-card" key={x.label}><span>{x.label}</span><strong>{x.value}</strong></div>)}</div>
  <form className="admin-filters" method="get"><input name="q" placeholder="ค้นหาจากหัวข้อข่าว…" defaultValue={query}/><select name="status" defaultValue={status}><option value="all">ทุกสถานะ</option><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่แล้ว</option><option value="archived">เก็บถาวร</option></select><button className="state-action">กรอง</button></form>
  <div className="ui-state"><div><strong>พบข่าว {articles.length} รายการ</strong><p>จัดการสถานะและเปิดแก้ไขข่าวได้จากรายการนี้</p></div></div>
  {articles.length?<div className="news-list">{articles.map(article=><article className="news-card admin-news-card" key={article.$id}><div className="news-meta"><span className="tag">{statusLabels[String(article.status)]??String(article.status)}</span><span>{article.updated_at?new Date(String(article.updated_at)).toLocaleString("th-TH"):""}</span></div><h2>{String(article.title??"")}</h2><p className="field-hint">{String(article.slug??"")}</p><AdminActions id={String(article.$id)} slug={String(article.slug??"")} status={String(article.status??"draft")}/></article>)}</div>:<div className="ui-state"><div><strong>ยังไม่มีข่าวตามตัวกรอง</strong><p>ลองเปลี่ยนสถานะหรือสร้างข่าวใหม่</p></div></div>}
  <p className="auth-register"><Link href="/news">ดูหน้าเว็บข่าว</Link> · <Link href="/dashboard">กลับ Dashboard</Link></p>
 </section></div></main>;
}