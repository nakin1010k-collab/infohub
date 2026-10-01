import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";
export default async function ProfilePage() {
 const supabase=await createClient(); const {data:{user},error}=await supabase.auth.getUser(); if(error||!user)redirect("/login?next=/profile");
 const {data:profile}=await supabase.from("profiles").select("display_name,role").eq("id",user.id).maybeSingle();
 return <main className="auth-page"><div className="auth-shell"><section className="auth-card" aria-labelledby="profile-title">
 <div className="auth-intro"><p className="eyebrow">MEMBER AREA</p><h1 id="profile-title">โปรไฟล์ของคุณ</h1><p>จัดการข้อมูลพื้นฐานของบัญชี</p></div>
 <div className="ui-state"><div><strong>{profile?.display_name||"สมาชิก InfoHub"}</strong><p>{user.email} · สิทธิ์ {profile?.role||"user"}</p></div></div>
 <ProfileForm initialName={profile?.display_name??""}/>
 <div className="profile-actions"><Link className="state-action" href="/settings">ตั้งค่า</Link><Link className="primary-button" href="/">กลับหน้าแรก</Link><SignOutButton /></div>
 </section></div></main>;
}