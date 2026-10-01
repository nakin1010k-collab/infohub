"use client";

import Link from "next/link";

export default function GlobalErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <section className="auth-card" aria-labelledby="app-error-title">
          <div className="auth-intro">
            <p className="eyebrow">INFOHUB</p>
            <h1 id="app-error-title">ระบบกำลังมีปัญหาชั่วคราว</h1>
            <p>
              ไม่สามารถโหลดข้อมูลจากระบบได้ในขณะนี้ ลองใหม่อีกครั้ง
              หรือกลับไปยังหน้าแรกภายหลัง
            </p>
          </div>
          <div className="profile-actions">
            <button className="auth-submit" type="button" onClick={() => reset()}>
              ลองใหม่
            </button>
            <Link className="primary-button" href="/login">
              เข้าสู่ระบบ
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
