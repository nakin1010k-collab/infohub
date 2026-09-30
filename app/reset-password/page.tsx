"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent } from "react";

export default function ResetPasswordPage() {
  function validatePasswords(form: HTMLFormElement) {
    const password = form.elements.namedItem("password") as HTMLInputElement | null;
    const confirmPassword = form.elements.namedItem("confirmPassword") as HTMLInputElement | null;

    if (!password || !confirmPassword) return;

    confirmPassword.setCustomValidity(
      password.value === confirmPassword.value ? "" : "รหัสผ่านไม่ตรงกัน",
    );
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    const form = event.currentTarget.form;
    if (form) validatePasswords(form);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    validatePasswords(event.currentTarget);

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>

        <section className="auth-card" aria-labelledby="reset-title">
          <div className="auth-intro">
            <p className="eyebrow">NEW PASSWORD</p>
            <h1 id="reset-title">ตั้งรหัสผ่านใหม่</h1>
            <p>กำหนดรหัสผ่านใหม่สำหรับบัญชี InfoHub ของคุณ</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="password">รหัสผ่านใหม่</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                minLength={8}
                required
                aria-describedby="reset-password-hint"
                onChange={handlePasswordChange}
              />
              <p id="reset-password-hint" className="field-hint">
                ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร
              </p>
            </div>

            <div className="form-field">
              <label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                minLength={8}
                required
                aria-describedby="reset-confirm-hint"
                onChange={handlePasswordChange}
              />
              <p id="reset-confirm-hint" className="field-hint">
                ต้องตรงกับรหัสผ่านใหม่
              </p>
            </div>

            <button className="auth-submit" type="submit">
              บันทึกรหัสผ่านใหม่
            </button>
          </form>

          <div className="auth-divider" aria-hidden="true">
            <span>หรือ</span>
          </div>

          <p className="auth-register">
            กลับไปที่ <Link href="/login">หน้าเข้าสู่ระบบ</Link>
          </p>
        </section>

        <p className="auth-note">ลิงก์รีเซ็ตจริงจะถูกตรวจสอบผ่าน Supabase Auth ใน Phase 2D</p>
      </div>
    </main>
  );
}
