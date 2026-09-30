import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=/dashboard");

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-card" aria-labelledby="dashboard-title">
          <div className="auth-intro"><p className="eyebrow">DASHBOARD</p><h1 id="dashboard-title">แดชบอร์ด</h1><p>พื้นที่สมาชิกสำหรับฟีเจอร์ส่วนตัวของ InfoHub</p></div>
          <div className="ui-state"><div><strong>กำลังเตรียมพื้นที่ส่วนตัว</strong><p>ฟีเจอร์บันทึกข่าวและฟีดส่วนตัวจะเพิ่มใน Phase 6</p></div></div>
          <SignOutButton />
        </section>
      </div>
    </main>
  );
}
