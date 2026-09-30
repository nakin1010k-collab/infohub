"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function validatePasswords(form: HTMLFormElement) {
    const password = form.elements.namedItem("password") as HTMLInputElement | null;
    const confirmPassword = form.elements.namedItem("confirmPassword") as HTMLInputElement | null;
    if (!password || !confirmPassword) return;
    confirmPassword.setCustomValidity(password.value === confirmPassword.value ? "" : "รหัสผ่านไม่ตรงกัน");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    validatePasswords(event.currentTarget);
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const form = new FormData(event.currentTarget);
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: String(form.get("password") ?? ""),
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กำลังกลับไปหน้าเข้าสู่ระบบ...");
        window.setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 900);
      }
    } catch {
      setError("ลิงก์รีเซ็ตอาจหมดอายุ หรือยังเชื่อมต่อ Supabase ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.form) validatePasswords(event.currentTarget.form);
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
        <section className="auth-card" aria-labelledby="reset-title">
          <div className="auth-intro"><p className="eyebrow">NEW PASSWORD</p><h1 id="reset-title">ตั้งรหัสผ่านใหม่</h1><p>กำหนดรหัสผ่านใหม่สำหรับบัญชี InfoHub ของคุณ</p></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field"><label htmlFor="password">รหัสผ่านใหม่</label><input id="password" name="password" type="password" autoComplete="new-password" placeholder="อย่างน้อย 8 ตัวอักษร" minLength={8} required aria-describedby="reset-password-hint" onChange={handlePasswordChange} /><p id="reset-password-hint" className="field-hint">ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร</p></div>
            <div className="form-field"><label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="กรอกรหัสผ่านอีกครั้ง" minLength={8} required aria-describedby="reset-confirm-hint" onChange={handlePasswordChange} /><p id="reset-confirm-hint" className="field-hint">ต้องตรงกับรหัสผ่านใหม่</p></div>
            {error && <p className="auth-status is-error" role="alert">{error}</p>}
            {success && <p className="auth-status is-success" role="status">{success}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}</button>
          </form>
          <div className="auth-divider" aria-hidden="true"><span>หรือ</span></div>
          <p className="auth-register">กลับไปที่ <Link href="/login">หน้าเข้าสู่ระบบ</Link></p>
        </section>
        <p className="auth-note">ลิงก์รีเซ็ตจะถูกตรวจสอบผ่าน Supabase Auth</p>
      </div>
    </main>
  );
}
