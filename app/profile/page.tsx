import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-card" aria-labelledby="profile-title">
          <div className="auth-intro">
            <p className="eyebrow">MEMBER AREA</p>
            <h1 id="profile-title">โปรไฟล์ของคุณ</h1>
            <p>หน้านี้เข้าถึงได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว</p>
          </div>
          <div className="ui-state">
            <strong>{user?.user_metadata?.display_name || "สมาชิก InfoHub"}</strong>
            <span>{user?.email || "บัญชีสมาชิก"}</span>
          </div>
          <p className="auth-register"><Link href="/">กลับหน้าแรก</Link></p>
        </section>
      </div>
    </main>
  );
}