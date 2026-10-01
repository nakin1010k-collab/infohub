import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function AnalyticsPage(){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect("/login?next=/admin/analytics");
 const {data:p}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle(); if(!p||!["editor","admin"].includes(p.role))redirect("/dashboard");
 const {data:events,error}=await supabase.from("analytics_events").select("article_id,created_at,articles(title,slug)").eq("event_name","article_view").order("created_at",{ascending:false}).limit(500);
 const counts=new Map<string,{title:string;slug:string;views:number}>(); for(const e of events??[]){const a=Array.isArray(e.articles)?e.articles[0]:e.articles;if(!a)continue;const old=counts.get(e.article_id)||{title:a.title,slug:a.slug,views:0};old.views++;counts.set(e.article_id,old);}
 const rows=[...counts.values()].sort((a,b)=>b.views-a.views);
 return <main className="auth-page"><div className="auth-shell admin-shell"><section className="auth-card admin-card"><div className="admin-heading-row"><div><p className="eyebrow">ANALYTICS</p><h1>สถิติการอ่านข่าว</h1><p>นับ article view จากหน้าเว็บ โดยเก็บข้อมูลแบบเบาและไม่ใช้บริการเสียเงิน</p></div><Link className="state-action" href="/admin">กลับ CMS</Link></div>{error?<div className="ui-state is-error"><div><strong>โหลด analytics ไม่สำเร็จ</strong><p>{error.message}</p></div></div>:<div className="news-list">{rows.length?rows.map(row=><article className="news-card admin-news-card" key={row.slug}><div className="news-meta"><span className="tag">{row.views} views</span></div><h2><Link href={"/news/"+row.slug}>{row.title}</Link></h2></article>):<div className="ui-state"><div><strong>ยังไม่มีข้อมูล</strong><p>เมื่อมีคนเปิดข่าว ระบบจะเริ่มนับ view</p></div></div>}</div>}</section></div></main>;
}