"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, SupabaseBrowserConfigError } from "@/lib/supabase/client";

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
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });

      if (signInError) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง");
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      const destination = isSafeInternalPath(next) ? next : "/";
      router.push(destination);
      router.refresh();
    } catch (error) {
      if (error instanceof SupabaseBrowserConfigError) {
        setError("ระบบสมาชิกยังไม่ได้ตั้งค่าในเว็บนี้ กรุณาตรวจสอบ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ใน production");
      } else {
        setError("ระบบสมาชิกไม่ตอบสนองในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือตรวจสอบสถานะระบบ");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>

        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-intro">
            <p className="eyebrow">WELCOME BACK</p>
            <h1 id="login-title">เข้าสู่ระบบ</h1>
            <p>เข้าสู่ InfoHub เพื่อจัดการโปรไฟล์และติดตามเรื่องที่คุณสนใจ</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">อีเมล</label>
              <input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" required />
            </div>

            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="password">รหัสผ่าน</label>
                <Link href="/forgot-password">ลืมรหัสผ่าน?</Link>
              </div>
              <input id="password" name="password" type="password" autoComplete="current-password" placeholder="กรอกรหัสผ่าน" required />
            </div>

            {error && <p className="auth-status is-error" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="auth-divider" aria-hidden="true"><span>หรือ</span></div>
          <p className="auth-register">ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link></p>
        </section>

        <p className="auth-note">ข้อมูลของคุณจะได้รับการดูแลอย่างปลอดภัย</p>
      </div>
    </main>
  );
}
