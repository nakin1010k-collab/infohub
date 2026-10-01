import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";
export default async function DashboardPage() {
 const supabase=await createClient(); const {data:{user},error}=await supabase.auth.getUser(); if(error||!user)redirect("/login?next=/dashboard");
 const {data:profile}=await supabase.from("profiles").select("display_name,role").eq("id",user.id).maybeSingle();
 const [{count:published},{count:drafts},{count:activity}]=await Promise.all([
  supabase.from("articles").select("id",{count:"exact",head:true}).eq("status","published"),
  supabase.from("articles").select("id",{count:"exact",head:true}).eq("status","draft"),
  supabase.from("article_audit_logs").select("id",{count:"exact",head:true}).eq("actor_id",user.id)
 ]);
 const editor=profile?.role==="editor"||profile?.role==="admin";
 return <main className="auth-page"><div className="auth-shell"><section className="auth-card" aria-labelledby="dashboard-title">
 <div className="auth-intro"><p className="eyebrow">DASHBOARD</p><h1 id="dashboard-title">แดชบอร์ด</h1><p>สวัสดี {profile?.display_name||user.email}</p></div>
 <div className="admin-kpi-grid"><div className="admin-kpi-card"><span>ข่าวเผยแพร่</span><strong>{published??0}</strong><small>ข่าวที่อ่านได้บนเว็บไซต์</small></div><div className="admin-kpi-card"><span>ฉบับร่าง</span><strong>{drafts??0}</strong><small>รอตรวจในระบบ</small></div><div className="admin-kpi-card"><span>กิจกรรมของฉัน</span><strong>{activity??0}</strong><small>Audit actions</small></div></div>
 <div className="profile-actions">{editor?<Link className="primary-button" href="/admin">เปิด CMS</Link>:null}<Link className="state-action" href="/news">อ่านข่าว</Link><Link className="state-action" href="/profile">โปรไฟล์</Link><Link className="state-action" href="/settings">ตั้งค่า</Link><SignOutButton /></div>
 </section></div></main>;
}