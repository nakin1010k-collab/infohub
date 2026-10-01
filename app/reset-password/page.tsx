"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovery, setRecovery] = useState<{ userId: string; secret: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");
    const secret = params.get("secret");
    if (userId && secret) setRecovery({ userId, secret });
    else setError("ลิงก์รีเซ็ตไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่อีกครั้ง");
  }, []);

  const ready = Boolean(recovery);

  function validatePasswords(form: HTMLFormElement) {
    const password = form.elements.namedItem("password") as HTMLInputElement | null;
    const confirmPassword = form.elements.namedItem("confirmPassword") as HTMLInputElement | null;
    if (!password || !confirmPassword) return;
    confirmPassword.setCustomValidity(password.value === confirmPassword.value ? "" : "รหัสผ่านไม่ตรงกัน");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); validatePasswords(event.currentTarget);
    if (!event.currentTarget.checkValidity()) { event.currentTarget.reportValidity(); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: recovery?.userId, secret: recovery?.secret, password: String(form.get("password") ?? "") }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.error ?? "ไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาขอลิงก์ใหม่อีกครั้ง"); return; }
      setSuccess("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กำลังกลับไปหน้าเข้าสู่ระบบ...");
      window.setTimeout(() => router.replace("/login"), 900);
    } catch { setError("ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาขอลิงก์รีเซ็ตใหม่แล้วลองอีกครั้ง"); }
    finally { setLoading(false); }
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) { if (event.currentTarget.form) validatePasswords(event.currentTarget.form); }

  return (
    <main className="auth-page"><div className="auth-shell">
      <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
      <section className="auth-card" aria-labelledby="reset-title">
        <div className="auth-intro"><p className="eyebrow">NEW PASSWORD</p><h1 id="reset-title">ตั้งรหัสผ่านใหม่</h1><p>กำหนดรหัสผ่านใหม่สำหรับบัญชี InfoHub ของคุณ</p></div>
        {!ready && <p className="auth-status is-error" role="alert">ลิงก์รีเซ็ตไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่อีกครั้ง</p>}
        {error && <p className="auth-status is-error" role="alert">{error}</p>}{success && <p className="auth-status is-success" role="status">{success}</p>}
        {ready && !success && <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field"><label htmlFor="password">รหัสผ่านใหม่</label><input id="password" name="password" type="password" autoComplete="new-password" placeholder="อย่างน้อย 8 ตัวอักษร" minLength={8} required onChange={handlePasswordChange} /></div>
          <div className="form-field"><label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="กรอกรหัสผ่านอีกครั้ง" minLength={8} required onChange={handlePasswordChange} /></div>
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}</button>
        </form>}
        <div className="auth-divider" aria-hidden="true"><span>หรือ</span></div><p className="auth-register">กลับไปที่ <Link href="/login">หน้าเข้าสู่ระบบ</Link></p>
      </section><p className="auth-note">ลิงก์รีเซ็ตจะถูกตรวจสอบผ่าน Appwrite Auth</p>
    </div></main>
  );
}
