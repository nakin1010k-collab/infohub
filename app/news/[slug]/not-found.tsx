import Link from "next/link";
import styles from "@/components/news-preview.module.css";

export default function NotFound() {
  return (
    <main className="auth-page">
      <div className={`auth-shell ${styles.shell}`}>
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <section className="auth-card" aria-labelledby="article-not-found-title">
          <div className="auth-intro">
            <p className="eyebrow">NEWS</p>
            <h1 id="article-not-found-title">ไม่พบบทความ</h1>
            <p>บทความนี้อาจถูกย้ายหรือยังไม่มีอยู่ในชุดข้อมูลตัวอย่าง</p>
          </div>
          <p className="auth-register">
            <Link href="/news">กลับไปข่าวทั้งหมด</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
