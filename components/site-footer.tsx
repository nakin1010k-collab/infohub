import Link from "next/link";

export function SiteFooter() {
  return (
    <footer id="about">
      <div className="container footer-inner">
        <Link href="/" aria-label="InfoHub หน้าแรก">🐱 InfoHub</Link>
        <span>ข่าวสาร • ข้อมูล • ความรู้</span>
      </div>
    </footer>
  );
}
