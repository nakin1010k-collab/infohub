import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { getAppwriteAccount } from "@/lib/appwrite/server";

export default async function ProfilePage() {
  const user = await getAppwriteAccount();
  if (!user) redirect("/login?next=/profile");
  return (
    <main className="auth-page"><div className="auth-shell"><section className="auth-card" aria-labelledby="profile-title">
      <div className="auth-intro"><p className="eyebrow">MEMBER AREA</p><h1 id="profile-title">โปรไฟล์ของคุณ</h1><p>ข้อมูลบัญชีของคุณ</p></div>
      <div className="ui-state"><div><strong>{user.name || "สมาชิก InfoHub"}</strong><p>{user.email}</p></div></div>
      <div className="profile-actions"><Link className="primary-button" href="/">กลับหน้าแรก</Link><SignOutButton /></div>
    </section></div></main>
  );
}
