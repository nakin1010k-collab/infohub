const categories = ["ข่าวเด่น", "ประเทศไทย", "ต่างประเทศ", "เทคโนโลยี", "ธุรกิจ", "ไลฟ์สไตล์", "ความรู้"];

const featured = [
  { tag: "ข่าวเด่น", title: "รวมเรื่องสำคัญที่ควรรู้วันนี้", summary: "ติดตามประเด็นที่กำลังได้รับความสนใจ พร้อมบริบทที่อ่านง่ายและกระชับ" },
  { tag: "เทคโนโลยี", title: "เทคโนโลยีใกล้ตัวที่กำลังเปลี่ยนชีวิตเรา", summary: "สรุปแนวโน้มใหม่ ๆ ให้เข้าใจได้ในไม่กี่นาที" },
  { tag: "ความรู้", title: "เรื่องน่ารู้ที่อธิบายด้วยข้อมูล", summary: "เชื่อมข่าว เหตุการณ์ และข้อมูลให้เห็นภาพเดียวกัน" }
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label="InfoHub หน้าแรก">
            <span className="brand-mark" aria-hidden="true">🐱</span>
            <span>InfoHub</span>
          </a>
          <nav aria-label="เมนูหลัก" className="main-nav">
            <a href="#news">ข่าวสาร</a>
            <a href="#knowledge">ความรู้</a>
            <a href="#data">ข้อมูล</a>
            <a href="#about">เกี่ยวกับ</a>
          </nav>
          <a className="login-link" href="/login">เข้าสู่ระบบ</a>
        </div>
      </header>

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
          <div className="hero-mascot" aria-label="มาสคอตแมวของ InfoHub" role="img">
            <div className="cat-orb">🐱</div>
            <div className="floating-card card-one">วันนี้มีอะไรน่าสนใจ?</div>
            <div className="floating-card card-two">อ่านง่าย • เข้าใจเร็ว</div>
          </div>
        </div>
      </section>

      <section className="container category-strip" aria-label="หมวดหมู่">
        {categories.map((category) => <a key={category} href="#news" className="category-pill">{category}</a>)}
      </section>

      <section id="news" className="container content-section">
        <div className="section-heading">
          <div><p className="eyebrow">FEATURED</p><h2>เรื่องเด่นวันนี้</h2></div>
          <a href="#latest">ดูทั้งหมด →</a>
        </div>
        <div className="featured-grid">
          {featured.map((item) => (
            <article className="news-card" key={item.title}>
              <div className="news-image" aria-hidden="true">✦</div>
              <div className="news-body">
                <span className="tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <a href="#latest">อ่านต่อ →</a>
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

      <footer id="about">
        <div className="container footer-inner"><span>🐱 InfoHub</span><span>ข่าวสาร • ข้อมูล • ความรู้</span></div>
      </footer>
    </main>
  );
}
