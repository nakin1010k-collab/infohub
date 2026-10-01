import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "@/components/news-preview.module.css";
import { getNewsArticle, getRelatedNews } from "@/lib/news/data";
import ArticleViewTracker from "@/app/components/article-view-tracker";

type NewsDetailPageProps = { params: Promise<{ slug: string }> };

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(value));
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) return { title: "ไม่พบบทความ | InfoHub", description: "ไม่พบบทความที่ต้องการบน InfoHub" };
  return { title: `${article.title} | InfoHub`, description: article.excerpt, keywords: [article.category, "ข่าว", "InfoHub"], alternates: { canonical: `/news/${article.slug}` }, openGraph: { title: article.title, description: article.excerpt, type: "article", publishedTime: article.publishedAt, url: `/news/${article.slug}` }, twitter: { card: "summary", title: article.title, description: article.excerpt } };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) notFound();
  const relatedNews = await getRelatedNews(article.slug);
  const paragraphs = article.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <main className="auth-page">
      <div className={`auth-shell ${styles.shell}`}>
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
        <article className="auth-card" aria-labelledby="article-title"><ArticleViewTracker slug={article.slug} />
          <div className="auth-intro"><div className="news-meta"><span className="tag">{article.category}</span><span>{formatPublishedAt(article.publishedAt)}</span><span>อ่าน {article.readingMinutes} นาที</span></div><h1 id="article-title">{article.title}</h1><p>{article.excerpt}</p></div>
          <div className={styles.articleBody}>
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className={styles.notice} role="note">เนื้อหานี้มาจากฐานข้อมูล InfoHub และอยู่ในสถานะเผยแพร่</div>
          </div>
          {relatedNews.length > 0 && <section className={styles.related} aria-labelledby="related-news-title"><div className={styles.relatedHeader}><p className="eyebrow">RELATED NEWS</p><h2 id="related-news-title">ข่าวที่เกี่ยวข้อง</h2></div><div className={styles.relatedList}>{relatedNews.map((related) => <Link className={styles.relatedItem} href={`/news/${related.slug}`} key={related.slug}><div className="news-meta"><span className="tag">{related.category}</span><span>อ่าน {related.readingMinutes} นาที</span></div><strong>{related.title}</strong><span>{related.excerpt}</span></Link>)}</div></section>}
          <p className="auth-register"><Link href="/news">← ข่าวทั้งหมด</Link></p>
        </article>
      </div>
    </main>
  );
}
