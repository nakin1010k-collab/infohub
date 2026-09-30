import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { getAppwriteAccount } from "@/lib/appwrite/server";

export default async function SettingsPage() {
  const user = await getAppwriteAccount();
  if (!user) redirect("/login?next=/settings");
  return (
    <main className="auth-page"><div className="auth-shell"><section className="auth-card" aria-labelledby="settings-title">
      <div className="auth-intro"><p className="eyebrow">SETTINGS</p><h1 id="settings-title">ตั้งค่า</h1><p>การตั้งค่าบัญชีและการแจ้งเตือนจะอยู่ที่นี่</p></div>
      <div className="ui-state"><div><strong>การตั้งค่าบัญชี</strong><p>กำลังเตรียมฟีเจอร์จัดการโปรไฟล์และการแจ้งเตือนสำหรับ Phase 6</p></div></div><SignOutButton />
    </section></div></main>
  );
}
