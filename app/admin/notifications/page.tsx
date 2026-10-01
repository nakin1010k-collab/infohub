import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function NotificationsPage(){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/admin/notifications");
 const{data:p}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();if(!p||!["editor","admin"].includes(p.role))redirect("/dashboard");
 const{data,error}=await supabase.from("notifications").select("id,type,title,message,read_at,created_at").order("created_at",{ascending:false}).limit(100);
 return <main className="auth-page"><div className="auth-shell admin-shell"><section className="auth-card admin-card"><div className="admin-heading-row"><div><p className="eyebrow">NOTIFICATIONS</p><h1>แจ้งเตือนระบบ</h1><p>ประวัติการแจ้งเตือน RSS และระบบ</p></div><Link className="state-action" href="/admin">กลับ CMS</Link></div>{error?<div className="ui-state is-error"><div><strong>โหลดแจ้งเตือนไม่สำเร็จ</strong><p>{error.message}</p></div></div>:<div className="news-list">{data?.length?data.map(n=><article className="news-card admin-news-card" key={n.id}><div className="news-meta"><span className="tag">{n.read_at?"อ่านแล้ว":"ใหม่"}</span><span>{new Date(n.created_at).toLocaleString("th-TH")}</span></div><h2>{n.title}</h2><p>{n.message}</p></article>):<div className="ui-state"><div><strong>ยังไม่มีแจ้งเตือน</strong></div></div>}</div>}</section></div></main>;
}