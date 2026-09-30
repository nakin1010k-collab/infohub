"use client";

import Link from "next/link";
import { FormEvent } from "react";

export default function RegisterPage() {
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

        <section className="auth-card" aria-labelledby="register-title">
          <div className="auth-intro">
            <p className="eyebrow">JOIN INFOHUB</p>
            <h1 id="register-title">สมัครสมาชิก</h1>
            <p>สร้างบัญชีเพื่อบันทึกเรื่องที่สนใจและติดตามเนื้อหาที่เหมาะกับคุณ</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name">ชื่อที่แสดง</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="ชื่อของคุณ"
                required
              />
            </div>

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
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                minLength={8}
                required
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="field-hint">
                ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร
              </p>
            </div>

            <div className="form-field">
              <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                minLength={8}
                required
              />
            </div>

            <label className="remember-row">
              <input type="checkbox" name="terms" required />
              <span>ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span>
            </label>

            <button className="auth-submit" type="submit">
              สร้างบัญชี
            </button>
          </form>

          <div className="auth-divider" aria-hidden="true">
            <span>หรือ</span>
          </div>

          <p className="auth-register">
            มีบัญชีอยู่แล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
          </p>
        </section>

        <p className="auth-note">ข้อมูลของคุณจะได้รับการดูแลอย่างปลอดภัย</p>
      </div>
    </main>
  );
}
