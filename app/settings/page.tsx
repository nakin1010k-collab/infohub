import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function SettingsPage() {
 const supabase=await createClient(); const {data:{user},error}=await supabase.auth.getUser(); if(error||!user)redirect("/login?next=/settings");
 return <main className="auth-page"><div className="auth-shell"><section className="auth-card" aria-labelledby="settings-title">
 <div className="auth-intro"><p className="eyebrow">SETTINGS</p><h1 id="settings-title">ตั้งค่า</h1><p>การตั้งค่าบัญชีและความเป็นส่วนตัว</p></div>
 <div className="ui-state"><div><strong>อีเมลบัญชี</strong><p>{user.email}</p></div></div>
 <div className="profile-actions"><Link className="state-action" href="/forgot-password">เปลี่ยนรหัสผ่าน</Link><Link className="state-action" href="/profile">แก้ไขโปรไฟล์</Link><Link className="primary-button" href="/">กลับหน้าแรก</Link></div>
 <p className="field-hint">การแจ้งเตือน RSS และการตั้งค่าเพิ่มเติมจะเพิ่มเมื่อเปิดระบบแจ้งเตือนในขั้นถัดไป</p>
 </section></div></main>;
}