import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/news-preview.module.css";
import { getAllTags, getNewsArticlesPage } from "@/lib/news/data";

export const metadata: Metadata = {
  title: "ข่าวทั้งหมด | InfoHub",
  description: "รวมข่าวจากฐานข้อมูล InfoHub แยกตามหมวดและแท็ก",
  keywords: ["ข่าว", "ข่าวเด่น", "เทคโนโลยี", "ข้อมูล", "ความรู้", "InfoHub"],
  alternates: { canonical: "/news" },
  openGraph: { title: "ข่าวทั้งหมด | InfoHub", description: "สำรวจข่าวของ InfoHub ตามหมวดและแท็ก", type: "website", url: "/news" },
};

type NewsPageProps = { searchParams: Promise<{ category?: string; tag?: string; page?: string }> };

const categoryOptions = [
  { slug: "all", label: "ทั้งหมด" },
  { slug: "news", label: "ข่าวเด่น" },
  { slug: "technology", label: "เทคโนโลยี" },
  { slug: "data", label: "ข้อมูล" },
  { slug: "knowledge", label: "ความรู้" },
];

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const category = params.category?.trim().toLocaleLowerCase("th-TH") || "all";
  const tag = params.tag?.trim() || "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const activeCategory = categoryOptions.some((option) => option.slug === category) ? category : "all";
  const [tags, newsPage] = await Promise.all([
    getAllTags(),
    getNewsArticlesPage({ categorySlug: activeCategory, tag, page, pageSize: 10 }),
  ]);
  const filteredArticles = newsPage.items;

  return (
    <main className="auth-page">
      <div className={`auth-shell ${styles.shell}`}>
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
        <section className="auth-card" aria-labelledby="news-title">
          <div className="auth-intro">
            <p className="eyebrow">NEWS</p>
            <h1 id="news-title">ข่าวทั้งหมด</h1>
            <p>{activeCategory === "all" ? "รวมข่าวจากฐานข้อมูล InfoHub" : `หมวด “${categoryOptions.find((option) => option.slug === activeCategory)?.label}” · พบ ${filteredArticles.length} รายการ`}</p>
          </div>
          <nav className={styles.form} aria-label="ตัวกรองหมวดข่าว">
            {categoryOptions.map((option) => <Link key={option.slug} href={option.slug === "all" ? "/news" : `/news?category=${option.slug}`} aria-current={activeCategory === option.slug ? "page" : undefined}>{option.label}</Link>)}
          </nav>
          {tag ? <p className="field-hint">กำลังกรองแท็ก: #{tag} · พบ {newsPage.total} รายการ</p> : null}
          <div className={styles.tagList} aria-label="แท็กที่ใช้ในข่าว">
            {tags.map((tag) => <Link className={styles.tagLink} href={`/news?tag=${encodeURIComponent(tag)}`} key={tag}>#{tag}</Link>)}
          </div>
          <div className={styles.list} aria-label="รายการข่าว">
            {filteredArticles.length > 0 ? filteredArticles.map((article) => (
              <article className={styles.item} key={article.slug}>
                <div className="news-meta"><span className="tag">{article.category}</span><span>อ่าน {article.readingMinutes} นาที</span><span>{article.tags.map((tag) => `#${tag}`).join(" · ")}</span></div>
                <h2><Link href={`/news/${article.slug}`}>{article.title}</Link></h2>
                <p>{article.excerpt}</p>
                <Link className="field-hint" href={`/news/${article.slug}`}>อ่านรายละเอียด →</Link>
              </article>
            )) : <div className="ui-state" role="status"><div><strong>ยังไม่มีข่าวในหมวดนี้</strong><p>ลองเลือกหมวดอื่น หรือกลับไปดูข่าวทั้งหมด</p></div></div>}
          </div>
          {newsPage.totalPages > 1 ? <nav className="admin-actions" aria-label="เปลี่ยนหน้าข่าว">
            {newsPage.page > 1 ? <Link className="state-action" href={`/news?category=${activeCategory === "all" ? "" : activeCategory}&tag=${encodeURIComponent(tag)}&page=${newsPage.page - 1}`}>← ก่อนหน้า</Link> : null}
            <span className="field-hint">หน้า {newsPage.page} / {newsPage.totalPages}</span>
            {newsPage.page < newsPage.totalPages ? <Link className="state-action" href={`/news?category=${activeCategory === "all" ? "" : activeCategory}&tag=${encodeURIComponent(tag)}&page=${newsPage.page + 1}`}>ถัดไป →</Link> : null}
          </nav> : null}
          <p className="auth-register"><Link href="/">กลับหน้าแรก</Link></p>
        </section>
      </div>
    </main>
  );
}
