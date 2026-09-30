"use client";

import Link from "next/link";
import { FormEvent } from "react";

export default function ForgotPasswordPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>

        <section className="auth-card" aria-labelledby="forgot-title">
          <div className="auth-intro">
            <p className="eyebrow">RESET ACCESS</p>
            <h1 id="forgot-title">ลืมรหัสผ่าน</h1>
            <p>กรอกอีเมลที่ใช้สมัครสมาชิก แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">อีเมล</label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                aria-describedby="forgot-email-hint"
              />
              <p id="forgot-email-hint" className="field-hint">
                ใช้อีเมลเดียวกับบัญชี InfoHub ของคุณ
              </p>
            </div>

            <button className="auth-submit" type="submit">
              ส่งลิงก์ตั้งรหัสผ่านใหม่
            </button>
          </form>

          <div className="auth-divider" aria-hidden="true">
            <span>หรือ</span>
          </div>

          <p className="auth-register">
            จำรหัสผ่านได้แล้ว? <Link href="/login">กลับเข้าสู่ระบบ</Link>
          </p>
        </section>

        <p className="auth-note">หากไม่พบอีเมล ลองตรวจสอบโฟลเดอร์สแปมด้วย</p>
      </div>
    </main>
  );
}
