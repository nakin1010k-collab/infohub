import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getStatus() {
  const checks = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  };

  if (!checks.supabaseUrl || !checks.supabaseKey) {
    return { ...checks, database: false, message: "Supabase environment variables are not configured." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("categories").select("id").limit(1);
    if (error) return { ...checks, database: false, message: error.message };
    return { ...checks, database: true, message: "Database connection is healthy." };
  } catch (error) {
    return {
      ...checks,
      database: false,
      message: error instanceof Error ? error.message : "Database health check failed.",
    };
  }
}

export default async function StatusPage() {
  const status = await getStatus();
  const healthy = status.supabaseUrl && status.supabaseKey && status.database;

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก">
          <span className="brand-mark" aria-hidden="true">🐱</span>
          <span>InfoHub</span>
        </Link>
        <section className="auth-card" aria-labelledby="status-title">
          <div className="auth-intro">
            <p className="eyebrow">SYSTEM STATUS</p>
            <h1 id="status-title">{healthy ? "ระบบพร้อมใช้งาน" : "ต้องตรวจสอบการเชื่อมต่อ"}</h1>
            <p>{healthy ? "Public database connection is healthy." : "หน้าเว็บยังทำงานได้ แต่ฐานข้อมูลหรือ configuration ยังไม่พร้อม"}</p>
          </div>

          <div className="profile-actions" style={{ display: "grid", gap: "10px" }}>
            <div>Supabase URL: <strong>{status.supabaseUrl ? "configured" : "missing"}</strong></div>
            <div>Supabase publishable key: <strong>{status.supabaseKey ? "configured" : "missing"}</strong></div>
            <div>Database: <strong>{status.database ? "ok" : "error"}</strong></div>
          </div>

          {!healthy ? (
            <div className="ui-state" role="alert" style={{ marginTop: "20px" }}>
              <div>
                <strong>Diagnostic message</strong>
                <p>{status.message}</p>
              </div>
            </div>
          ) : null}

          <p className="auth-register"><Link href="/">กลับหน้าแรก</Link></p>
        </section>
      </div>
    </main>
  );
}
