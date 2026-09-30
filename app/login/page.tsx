"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function isSafeInternalPath(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"));
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง");
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      router.push(isSafeInternalPath(next) ? next : "/");
      router.refresh();
    } catch {
      setError("ระบบสมาชิกยังไม่พร้อมใช้งาน กรุณาลองอีกครั้งภายหลัง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-intro"><p className="eyebrow">WELCOME BACK</p><h1 id="login-title">เข้าสู่ระบบ</h1><p>เข้าสู่ InfoHub เพื่อจัดการโปรไฟล์และติดตามเรื่องที่คุณสนใจ</p></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field"><label htmlFor="email">อีเมล</label><input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" required /></div>
            <div className="form-field"><div className="field-label-row"><label htmlFor="password">รหัสผ่าน</label><Link href="/forgot-password">ลืมรหัสผ่าน?</Link></div><input id="password" name="password" type="password" autoComplete="current-password" placeholder="กรอกรหัสผ่าน" required /></div>
            {error && <p className="auth-status is-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
          </form>
          <div className="auth-divider" aria-hidden="true"><span>หรือ</span></div>
          <p className="auth-register">ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link></p>
        </section>
        <p className="auth-note">ข้อมูลของคุณจะได้รับการดูแลอย่างปลอดภัย</p>
      </div>
    </main>
  );
}
