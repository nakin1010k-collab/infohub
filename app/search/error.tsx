"use client";

import Link from "next/link";
import styles from "@/components/news-preview.module.css";

export default function SearchError({ reset }: { reset: () => void }) {
  return (
    <main className="auth-page">
      <div className={`auth-shell ${styles.shell}`}>
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <section className="auth-card" aria-labelledby="search-error-title">
          <div className="auth-intro">
            <p className="eyebrow">SEARCH</p>
            <h1 id="search-error-title">ค้นหาไม่สำเร็จ</h1>
            <p>ไม่สามารถประมวลผลการค้นหาได้ในขณะนี้ ลองใหม่อีกครั้งหรือดูข่าวทั้งหมด</p>
          </div>
          <div className="profile-actions">
            <button className="auth-submit" type="button" onClick={() => reset()}>
              ลองใหม่
            </button>
            <Link className="primary-button" href="/news">ดูข่าวทั้งหมด</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
