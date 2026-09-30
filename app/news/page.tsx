import Link from "next/link";
import { newsArticles } from "@/lib/news/mock-data";

export default function NewsPage() {
  return (
    <main className="auth-page">
      <div className="auth-shell news-list-shell">
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <section className="auth-card" aria-labelledby="news-title">
          <div className="auth-intro">
            <p className="eyebrow">NEWS</p>
            <h1 id="news-title">ข่าวทั้งหมด</h1>
            <p>โครงสร้างหน้า News พร้อมข้อมูลตัวอย่างสำหรับพัฒนา UI ก่อนเชื่อมฐานข้อมูลจริง</p>
          </div>
          <div className="news-list" aria-label="รายการข่าว">
            {newsArticles.map((article) => (
              <article className="news-list-item" key={article.slug}>
                <div className="news-meta">
                  <span className="tag">{article.category}</span>
                  <span>อ่าน {article.readingMinutes} นาที</span>
                </div>
                <h2>{article.title}</h2>
                <p>{article.excerpt}</p>
                <span className="field-hint">บทความรายละเอียดจะเชื่อมใน Phase 3C</span>
              </article>
            ))}
          </div>
          <p className="auth-register"><Link href="/">กลับหน้าแรก</Link></p>
        </section>
      </div>
    </main>
  );
}
