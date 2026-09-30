import Link from "next/link";
import styles from "@/components/news-preview.module.css";
import { getAllTags, newsArticles } from "@/lib/news/mock-data";

type NewsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

const categoryOptions = [
  { slug: "all", label: "ทั้งหมด" },
  { slug: "news", label: "ข่าวเด่น" },
  { slug: "technology", label: "เทคโนโลยี" },
  { slug: "data", label: "ข้อมูล" },
  { slug: "knowledge", label: "ความรู้" },
];

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const tags = getAllTags();
  const category = params.category?.trim().toLocaleLowerCase("th-TH") || "all";
  const activeCategory = categoryOptions.some((option) => option.slug === category) ? category : "all";
  const filteredArticles =
    activeCategory === "all"
      ? newsArticles
      : newsArticles.filter((article) => article.categorySlug === activeCategory);

  return (
    <main className="auth-page">
      <div className={`auth-shell ${styles.shell}`}>
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <section className="auth-card" aria-labelledby="news-title">
          <div className="auth-intro">
            <p className="eyebrow">NEWS</p>
            <h1 id="news-title">ข่าวทั้งหมด</h1>
            <p>
              {activeCategory === "all"
                ? "รวมข่าวตัวอย่างสำหรับพัฒนา UI ก่อนเชื่อมฐานข้อมูลจริง"
                : `หมวด “${categoryOptions.find((option) => option.slug === activeCategory)?.label}” · พบ ${filteredArticles.length} รายการ`}
            </p>
          </div>

          <nav className={styles.form} aria-label="ตัวกรองหมวดข่าว">
            {categoryOptions.map((option) => (
              <Link
                key={option.slug}
                href={option.slug === "all" ? "/news" : `/news?category=${option.slug}`}
                aria-current={activeCategory === option.slug ? "page" : undefined}
              >
                {option.label}
              </Link>
            ))}
          </nav>

          <div className={styles.tagList} aria-label="แท็กที่ใช้ในข่าว">
            {tags.map((tag) => (
              <Link className={styles.tagLink} href={`/search?q=${encodeURIComponent(tag)}`} key={tag}>
                #{tag}
              </Link>
            ))}
          </div>

          <div className={styles.list} aria-label="รายการข่าว">
            {filteredArticles.length > 0 ? filteredArticles.map((article) => (
              <article className={styles.item} key={article.slug}>
                <div className="news-meta">
                  <span className="tag">{article.category}</span>
                  <span>อ่าน {article.readingMinutes} นาที</span>
                  <span>{article.tags.map((tag) => `#${tag}`).join(" · ")}</span>
                </div>
                <h2><Link href={`/news/${article.slug}`}>{article.title}</Link></h2>
                <p>{article.excerpt}</p>
                <Link className="field-hint" href={`/news/${article.slug}`}>อ่านรายละเอียด →</Link>
              </article>
            )) : (
              <div className="ui-state" role="status">
                <div>
                  <strong>ไม่พบข่าวในหมวดนี้</strong>
                  <p>ลองเลือกหมวดอื่น หรือดูข่าวทั้งหมด</p>
                </div>
              </div>
            )}
          </div>
          <p className="auth-register"><Link href="/">กลับหน้าแรก</Link></p>
        </section>
      </div>
    </main>
  );
}
