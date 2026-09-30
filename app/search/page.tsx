import Link from "next/link";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <section className="auth-card" aria-labelledby="search-title">
          <div className="auth-intro">
            <p className="eyebrow">SEARCH</p>
            <h1 id="search-title">ค้นหา</h1>
            <p>{query ? `ผลการค้นหาสำหรับ “${query}”` : "พิมพ์คำค้นหาเพื่อเริ่มค้นหา"}</p>
          </div>
          <div className="ui-state">
            <div>
              <strong>ระบบค้นหาข่าวกำลังอยู่ระหว่างการพัฒนา</strong>
              <p>การค้นหาข่าวและข้อมูลจริงจะเชื่อมกับฐานข้อมูลใน Phase 3</p>
            </div>
          </div>
          <p className="auth-register"><Link href="/">กลับหน้าแรก</Link></p>
        </section>
      </div>
    </main>
  );
}
