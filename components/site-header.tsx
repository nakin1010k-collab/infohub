import Link from "next/link";

const navItems = [
  { href: "#news", label: "ข่าวสาร" },
  { href: "#knowledge", label: "ความรู้" },
  { href: "#data", label: "ข้อมูล" },
  { href: "#about", label: "เกี่ยวกับ" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <nav aria-label="เมนูหลัก" className="main-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="login-link" href="/login">
          เข้าสู่ระบบ
        </Link>
      </div>
    </header>
  );
}
