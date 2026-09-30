"use client";

import Link from "next/link";
import { FormEvent } from "react";

export default function LoginPage() {
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

        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-intro">
            <p className="eyebrow">WELCOME BACK</p>
            <h1 id="login-title">เข้าสู่ระบบ</h1>
            <p>เข้าสู่ InfoHub เพื่อจัดการโปรไฟล์และติดตามเรื่องที่คุณสนใจ</p>
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
              />
            </div>

            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="password">รหัสผ่าน</label>
                <Link href="/forgot-password">ลืมรหัสผ่าน?</Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>

            <label className="remember-row">
              <input type="checkbox" name="remember" />
              <span>จดจำการเข้าสู่ระบบ</span>
            </label>

            <button className="auth-submit" type="submit">
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="auth-divider" aria-hidden="true">
            <span>หรือ</span>
          </div>

          <p className="auth-register">
            ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link>
          </p>
        </section>

        <p className="auth-note">ข้อมูลของคุณจะได้รับการดูแลอย่างปลอดภัย</p>
      </div>
    </main>
  );
}
