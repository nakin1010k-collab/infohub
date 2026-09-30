import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?next=/profile");
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-card" aria-labelledby="profile-title">
          <div className="auth-intro">
            <p className="eyebrow">MEMBER AREA</p>
            <h1 id="profile-title">โปรไฟล์ของคุณ</h1>
            <p>ข้อมูลบัญชีของคุณ</p>
          </div>
          <div className="ui-state">
            <div>
              <strong>{user.user_metadata?.display_name || "สมาชิก InfoHub"}</strong>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="profile-actions">
            <Link className="primary-button" href="/">กลับหน้าแรก</Link>
            <SignOutButton />
          </div>
        </section>
      </div>
    </main>
  );
}
