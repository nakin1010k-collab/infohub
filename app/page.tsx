import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { EmptyState } from "@/components/ui-states";
import { newsArticles } from "@/lib/news/mock-data";

const categories = [
  { label: "ข่าวเด่น", slug: "news", icon: "✦" },
  { label: "เทคโนโลยี", slug: "technology", icon: "⌘" },
  { label: "ข้อมูล", slug: "data", icon: "◎" },
  { label: "ความรู้", slug: "knowledge", icon: "?" },
];

const featured = newsArticles.slice(0, 3);
const latest = newsArticles;

function HeroMascot() {
  return (
    <div className="hero-mascot" aria-label="มาสคอตแมวของ InfoHub" role="img">
      <div className="mascot-glow" aria-hidden="true" />
      <div className="cat-3d" aria-hidden="true">
        <span className="cat-ear cat-ear-left" />
        <span className="cat-ear cat-ear-right" />
        <span className="cat-head">
          <span className="cat-face">
            <i className="cat-eye cat-eye-left" />
            <i className="cat-eye cat-eye-right" />
            <i className="cat-nose" />
            <i className="cat-mouth" />
            <i className="cat-cheek cat-cheek-left" />
            <i className="cat-cheek cat-cheek-right" />
          </span>
        </span>
        <span className="cat-body">
          <span className="cat-belly" />
          <span className="cat-paw cat-paw-left" />
          <span className="cat-paw cat-paw-right" />
        </span>
        <span className="cat-tail" />
      </div>
      <div className="floating-card card-one">วันนี้มีอะไรน่าสนใจ?</div>
      <div className="floating-card card-two">อ่านง่าย • เข้าใจเร็ว</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <SiteHeader />

      <main id="main-content">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">INFO • DATA • KNOWLEDGE</p>
              <h1>
                ทุกเรื่องที่คุณอยากรู้
                <br />
                <span>รวมไว้ในที่เดียว</span>
              </h1>
              <p className="hero-text">
                ศูนย์รวมข่าวสาร ข้อมูล และความรู้ที่ออกแบบให้ค้นหาง่าย อ่านสบาย
                และเข้าใจบริบทได้มากขึ้น
              </p>
              <form
                className="search"
                role="search"
                action="/search"
                method="get"
                aria-label="ค้นหาข่าวสารและความรู้"
              >
                <label htmlFor="search" className="sr-only">
                  ค้นหาข่าวสารและความรู้
                </label>
                <input
                  id="search"
                  name="q"
                  type="search"
                  placeholder="ค้นหาข่าวสาร ความรู้ หรือข้อมูล..."
                />
                <button type="submit">ค้นหา</button>
              </form>
            </div>
            <HeroMascot />
          </div>
        </section>

        <section
          className="container category-navigation"
          aria-labelledby="category-title"
        >
          <div className="category-heading">
            <div>
              <p className="eyebrow">EXPLORE</p>
              <h2 id="category-title">สำรวจตามหมวดหมู่</h2>
            </div>
            <span>เลือกหัวข้อที่อยากติดตาม</span>
          </div>

          <nav className="category-strip" aria-label="หมวดหมู่ข่าวและความรู้">
            {categories.map((category, index) => (
              <a
                key={category.slug}
                href={`/news?category=${category.slug}`}
                className={`category-pill${index === 0 ? " is-active" : ""}`}
                aria-current={index === 0 ? "location" : undefined}
              >
                <span className="category-icon" aria-hidden="true">
                  {category.icon}
                </span>
                <span>{category.label}</span>
              </a>
            ))}
          </nav>
        </section>

        <section
          className="container category-preview-grid"
          aria-label="หมวดหมู่ยอดนิยม"
        >
          {categories.map((category, index) => (
            <a
              href={`/news?category=${category.slug}`}
              className="category-preview-card"
              key={category.slug}
            >
              <span className="category-preview-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <strong>{category.label}</strong>
                <span>ดูเรื่องราวและข้อมูลล่าสุด</span>
              </div>
              <span className="category-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </section>

        <section id="news" className="container content-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FEATURED</p>
              <h2>เรื่องเด่นวันนี้</h2>
            </div>
            <a href="/news">ดูทั้งหมด →</a>
          </div>

          <div className="featured-grid">
            {featured.map((article, index) => (
              <article
                className={`news-card ${index === 0 ? "is-featured" : ""}`}
                key={article.slug}
              >
                <div
                  className={`news-image news-image-${index + 1}`}
                  aria-hidden="true"
                >
                  <span>{index === 0 ? "✦" : index === 1 ? "⌘" : "◌"}</span>
                  {index === 0 && <small>EDITOR&apos;S PICK</small>}
                </div>
                <div className="news-body">
                  <div className="news-meta">
                    <span className="tag">{article.category}</span>
                    <span aria-label={`ใช้เวลาอ่าน ${article.readingMinutes} นาที`}>
                      อ่าน {article.readingMinutes} นาที
                    </span>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <a
                    href={`/news/${article.slug}`}
                    aria-label={`อ่านต่อ: ${article.title}`}
                  >
                    อ่านต่อ <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="knowledge" className="container split-section">
          <div className="info-panel">
            <p className="eyebrow">KNOWLEDGE</p>
            <h2>เปลี่ยนข่าวให้เป็นความเข้าใจ</h2>
            <p>
              InfoHub จะเชื่อมข่าวกับบุคคล องค์กร สถานที่ เหตุการณ์ และข้อมูลสถิติ
              เพื่อช่วยให้เห็นภาพรวมมากกว่าการอ่านพาดหัวเพียงอย่างเดียว
            </p>
            <a className="primary-button" href="/news?category=knowledge">
              สำรวจฐานความรู้
            </a>
          </div>
          <div id="data" className="data-panel">
            <div>
              <strong>01</strong>
              <span>ข่าวและเหตุการณ์</span>
            </div>
            <div>
              <strong>02</strong>
              <span>บุคคลและองค์กร</span>
            </div>
            <div>
              <strong>03</strong>
              <span>ข้อมูลและสถิติ</span>
            </div>
            <div>
              <strong>04</strong>
              <span>ไทม์ไลน์</span>
            </div>
          </div>
        </section>

        <section id="latest" className="container content-section latest-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LATEST • TRENDING</p>
              <h2>อัปเดตล่าสุด</h2>
            </div>
            <a href="/news">ดูข่าวทั้งหมด →</a>
          </div>

          <div className="latest-layout">
            <div className="latest-list" aria-live="polite">
              {latest.length > 0 ? (
                latest.map((article) => (
                  <a
                    className="latest-item"
                    href={`/news/${article.slug}`}
                    key={article.slug}
                  >
                    <span className="latest-time">
                      {new Intl.DateTimeFormat("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Bangkok",
                      }).format(new Date(article.publishedAt))}
                    </span>
                    <div className="latest-copy">
                      <div className="latest-item-meta">
                        <span className="tag">{article.category}</span>
                        <span>
                          อ่าน {article.readingMinutes} นาที
                        </span>
                      </div>
                      <b>{article.title}</b>
                      <p>{article.excerpt}</p>
                    </div>
                    <span className="latest-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ))
              ) : (
                <EmptyState />
              )}
            </div>

            <aside className="trending-panel" aria-labelledby="trending-title">
              <div className="trending-heading">
                <div>
                  <p className="eyebrow">TRENDING</p>
                  <h3 id="trending-title">กำลังเป็นที่สนใจ</h3>
                </div>
                <span>วันนี้</span>
              </div>
              <ol>
                {latest.slice(0, 4).map((article, index) => (
                  <li key={article.slug}>
                    <span className="trend-rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <span className="tag">{article.category}</span>
                      <b>{article.title}</b>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
