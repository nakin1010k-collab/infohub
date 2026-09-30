import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const categories = [
  { label: "ข่าวเด่น", id: "news" },
  { label: "ประเทศไทย", id: "thailand" },
  { label: "ต่างประเทศ", id: "world" },
  { label: "เทคโนโลยี", id: "technology" },
  { label: "ธุรกิจ", id: "business" },
  { label: "ไลฟ์สไตล์", id: "lifestyle" },
  { label: "ความรู้", id: "knowledge" }
];

const featured = [
  { tag: "ข่าวเด่น", title: "รวมเรื่องสำคัญที่ควรรู้วันนี้", summary: "ติดตามประเด็นที่กำลังได้รับความสนใจ พร้อมบริบทที่อ่านง่ายและกระชับ", meta: "5 นาที", tone: "featured" },
  { tag: "เทคโนโลยี", title: "เทคโนโลยีใกล้ตัวที่กำลังเปลี่ยนชีวิตเรา", summary: "สรุปแนวโน้มใหม่ ๆ ให้เข้าใจได้ในไม่กี่นาที", meta: "4 นาที", tone: "standard" },
  { tag: "ความรู้", title: "เรื่องน่ารู้ที่อธิบายด้วยข้อมูล", summary: "เชื่อมข่าว เหตุการณ์ และข้อมูลให้เห็นภาพเดียวกัน", meta: "6 นาที", tone: "standard" }
];

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
    <main>
      <SiteHeader />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">INFO • DATA • KNOWLEDGE</p>
            <h1>ทุกเรื่องที่คุณอยากรู้<br /><span>รวมไว้ในที่เดียว</span></h1>
            <p className="hero-text">ศูนย์รวมข่าวสาร ข้อมูล และความรู้ที่ออกแบบให้ค้นหาง่าย อ่านสบาย และเข้าใจบริบทได้มากขึ้น</p>
            <form className="search" role="search">
              <label htmlFor="search" className="sr-only">ค้นหาข่าวสารและความรู้</label>
              <input id="search" type="search" placeholder="ค้นหาข่าวสาร ความรู้ หรือข้อมูล..." />
              <button type="submit">ค้นหา</button>
            </form>
          </div>
          <HeroMascot />
        </div>
      </section>

      <section className="container category-navigation" aria-labelledby="category-title">
        <div className="category-heading">
          <div>
            <p className="eyebrow">EXPLORE</p>
            <h2 id="category-title">สำรวจตามหมวดหมู่</h2>
          </div>
          <span>เลือกหัวข้อที่อยากติดตาม</span>
        </div>
        <nav className="category-strip" aria-label="หมวดหมู่ข่าวและความรู้">
          {categories.map((category, index) => {
            const icons = ["✦", "TH", "◎", "⌘", "฿", "♡", "?"];
            return (
              <a key={category.id} href={index === 0 ? "#news" : "#category-" + category.id} className={"category-pill" + (index === 0 ? " is-active" : "")} aria-current={index === 0 ? "page" : undefined}>
                <span className="category-icon" aria-hidden="true">{icons[index]}</span>
                <span>{category.label}</span>
              </a>
            );
          })}
        </nav>
      </section>

      <section className="container category-preview-grid" aria-label="หมวดหมู่ยอดนิยม">
        {categories.slice(1, 4).map((category, index) => (
          <a id={"category-" + category.id} href="#latest" className="category-preview-card" key={category.id}>
            <span className="category-preview-number">0{index + 1}</span>
            <div><strong>{category.label}</strong><span>ดูเรื่องราวและข้อมูลล่าสุด</span></div>
            <span className="category-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </section>

      <section id="news" className="container content-section">
        <div className="section-heading">
          <div><p className="eyebrow">FEATURED</p><h2>เรื่องเด่นวันนี้</h2></div>
          <a href="#latest">ดูทั้งหมด →</a>
        </div>
        <div className="featured-grid">
          {featured.map((item, index) => (
            <article className={"news-card " + (item.tone === "featured" ? "is-featured" : "")} key={item.title}>
              <div className={"news-image news-image-" + (index + 1)} aria-hidden="true">
                <span>{index === 0 ? "✦" : index === 1 ? "⌘" : "◌"}</span>
                {index === 0 && <small>EDITOR&apos;S PICK</small>}
              </div>
              <div className="news-body">
                <div className="news-meta">
                  <span className="tag">{item.tag}</span>
                  <span aria-label={"ใช้เวลาอ่าน " + item.meta}>อ่าน {item.meta}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <a href="#latest" aria-label={"อ่านต่อ: " + item.title}>อ่านต่อ <span aria-hidden="true">→</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="knowledge" className="container split-section">
        <div className="info-panel">
          <p className="eyebrow">KNOWLEDGE</p>
          <h2>เปลี่ยนข่าวให้เป็นความเข้าใจ</h2>
          <p>InfoHub จะเชื่อมข่าวกับบุคคล องค์กร สถานที่ เหตุการณ์ และข้อมูลสถิติ เพื่อช่วยให้เห็นภาพรวมมากกว่าการอ่านพาดหัวเพียงอย่างเดียว</p>
          <a className="primary-button" href="#data">สำรวจฐานความรู้</a>
        </div>
        <div id="data" className="data-panel">
          <div><strong>01</strong><span>ข่าวและเหตุการณ์</span></div>
          <div><strong>02</strong><span>บุคคลและองค์กร</span></div>
          <div><strong>03</strong><span>ข้อมูลและสถิติ</span></div>
          <div><strong>04</strong><span>ไทม์ไลน์</span></div>
        </div>
      </section>

      <section id="latest" className="container content-section latest-section">
        <div className="section-heading"><div><p className="eyebrow">LATEST</p><h2>อัปเดตล่าสุด</h2></div><a href="#news">ดูทั้งหมด →</a></div>
        <div className="latest-list">
          <article><span>10:30</span><div><b>สรุปประเด็นข่าวสำคัญประจำวัน</b><p>บริบทและข้อมูลที่เกี่ยวข้องในเรื่องเดียว</p></div></article>
          <article><span>09:45</span><div><b>ข้อมูลใหม่ที่น่าจับตา</b><p>ตัวเลขและข้อเท็จจริงที่ควรรู้</p></div></article>
          <article><span>08:20</span><div><b>เรื่องน่ารู้ประจำวันนี้</b><p>อ่านสั้น ๆ พร้อมแหล่งอ้างอิง</p></div></article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
