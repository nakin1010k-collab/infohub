"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { href: "#news", label: "ข่าวสาร" }, { href: "#knowledge", label: "ความรู้" },
  { href: "#data", label: "ข้อมูล" }, { href: "#about", label: "เกี่ยวกับ" }
];

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then((response) => response.ok && response.json()).then((body) => setSignedIn(Boolean(body?.authenticated))).catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setSignedIn(false); setLoggingOut(false); window.location.href = "/";
  }

  return (
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href="/" aria-label="InfoHub หน้าแรก"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
      <nav aria-label="เมนูหลัก" className="main-nav">{navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
      {signedIn ? <div className="header-auth-actions"><Link className="login-link" href="/profile">โปรไฟล์</Link><button className="login-link" type="button" onClick={handleLogout} disabled={loggingOut}>{loggingOut ? "กำลังออก..." : "ออกจากระบบ"}</button></div> : <Link className="login-link" href="/login">เข้าสู่ระบบ</Link>}
    </div></header>
  );
}
