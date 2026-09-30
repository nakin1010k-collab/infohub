"use client";

import Link from "next/link";
import styles from "@/components/news-preview.module.css";

export default function NewsError({ reset }: { reset: () => void }) {
  return (
    <main className="auth-page">
      <div className={`auth-shell ${styles.shell}`}>
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <section className="auth-card" aria-labelledby="news-error-title">
          <div className="auth-intro">
            <p className="eyebrow">NEWS</p>
            <h1 id="news-error-title">เกิดข้อผิดพลาด</h1>
            <p>ไม่สามารถโหลดข้อมูลข่าวได้ในขณะนี้ ลองใหม่อีกครั้งหรือกลับไปหน้าแรก</p>
          </div>
          <div className="profile-actions">
            <button className="auth-submit" type="button" onClick={() => reset()}>
              ลองใหม่
            </button>
            <Link className="primary-button" href="/">หน้าแรก</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
