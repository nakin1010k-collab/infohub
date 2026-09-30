import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/news-preview.module.css";
import { searchNews } from "@/lib/news/mock-data";

export const metadata: Metadata = {
  title: "ค้นหา | InfoHub",
  description: "ค้นหาข่าว ความรู้ และข้อมูลตัวอย่างบน InfoHub",
  keywords: ["ค้นหา", "ข่าว", "ความรู้", "ข้อมูล", "InfoHub"],
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
  openGraph: {
    title: "ค้นหา | InfoHub",
    description: "ค้นหาข่าว ความรู้ และข้อมูลตัวอย่างบน InfoHub",
    type: "website",
    url: "/search",
  },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const results = searchNews(query);

  return (
    <main className="auth-page">
      <div className={`auth-shell ${styles.shell}`}>
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <section className="auth-card" aria-labelledby="search-title">
          <div className="auth-intro">
            <p className="eyebrow">SEARCH</p>
            <h1 id="search-title">ค้นหา</h1>
            <p>
              {query
                ? <>ผลการค้นหาสำหรับ “{query}” · พบ {results.length} รายการ</>
                : "ค้นหาจากข้อมูลตัวอย่างของ InfoHub"}
            </p>
          </div>

          <form className={`search ${styles.form}`} action="/search" method="get" role="search">
            <label htmlFor="search-page-query" className="sr-only">คำค้นหา</label>
            <input
              id="search-page-query"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="ค้นหาข่าวสาร ความรู้ หรือข้อมูล..."
            />
            <button type="submit">ค้นหา</button>
          </form>

          <div className={styles.list} aria-live="polite">
            {results.length > 0 ? results.map((article) => (
              <article className={styles.item} key={article.slug}>
                <div className="news-meta">
                  <span className="tag">{article.category}</span>
                  <span>อ่าน {article.readingMinutes} นาที</span>
                </div>
                <h2><Link href={`/news/${article.slug}`}>{article.title}</Link></h2>
                <p>{article.excerpt}</p>
                <Link className="field-hint" href={`/news/${article.slug}`}>อ่านรายละเอียด →</Link>
              </article>
            )) : (
              <div className="ui-state" role="status">
                <div>
                  <strong>ไม่พบผลการค้นหา</strong>
                  <p>ลองใช้คำค้นหาอื่น หรือกลับไปดูข่าวทั้งหมด</p>
                </div>
              </div>
            )}
          </div>

          <p className="auth-register">
            <Link href="/news">ดูข่าวทั้งหมด</Link> · <Link href="/">กลับหน้าแรก</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
