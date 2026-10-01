import Link from "next/link";
import { getAppwriteConfig, appwriteRequest } from "@/lib/appwrite/server";

export const dynamic = "force-dynamic";

type Status = {
  endpoint: boolean;
  project: boolean;
  appwrite: boolean;
  databaseConfig: boolean;
  reason: "missing_config" | "appwrite_unreachable" | "database_not_configured" | "appwrite_ok";
};

async function getStatus(): Promise<Status> {
  const { endpoint, projectId } = getAppwriteConfig();
  const databaseConfig = Boolean(process.env.APPWRITE_DATABASE_ID && process.env.APPWRITE_ARTICLES_TABLE_ID);
  try {
    const response = await appwriteRequest("/health/version", { method: "GET" });
    if (!response.ok) return { endpoint: Boolean(endpoint), project: Boolean(projectId), appwrite: false, databaseConfig, reason: "appwrite_unreachable" };
  } catch {
    return { endpoint: Boolean(endpoint), project: Boolean(projectId), appwrite: false, databaseConfig, reason: "appwrite_unreachable" };
  }
  if (!databaseConfig) return { endpoint: true, project: true, appwrite: true, databaseConfig: false, reason: "database_not_configured" };
  return { endpoint: true, project: true, appwrite: true, databaseConfig: true, reason: "appwrite_ok" };
}

export default async function StatusPage() {
  const status = await getStatus();
  const healthy = status.endpoint && status.project && status.appwrite && status.databaseConfig;
  return (
    <main className="auth-page"><div className="auth-shell">
      <Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
      <section className="auth-card" aria-labelledby="status-title">
        <div className="auth-intro"><p className="eyebrow">SYSTEM STATUS</p><h1 id="status-title">{healthy ? "ระบบพร้อมใช้งาน" : "ต้องตรวจสอบการเชื่อมต่อ"}</h1><p>{healthy ? "Appwrite configuration is ready." : "หน้าเว็บยังทำงานได้ แต่ Appwrite configuration หรือฐานข้อมูลยังไม่พร้อม"}</p></div>
        <div className="profile-actions" style={{display:"grid",gap:"10px"}}>
          <div>Appwrite endpoint: <strong>{status.endpoint ? "configured" : "missing"}</strong></div>
          <div>Appwrite project: <strong>{status.project ? "configured" : "missing"}</strong></div>
          <div>Appwrite service: <strong>{status.appwrite ? "ok" : "error"}</strong></div>
          <div>Database configuration: <strong>{status.databaseConfig ? "configured" : "missing"}</strong></div>
        </div>
        {!healthy ? <div className="ui-state" role="alert" style={{marginTop:"20px"}}><div><strong>Diagnostic code</strong><p>{status.reason}</p></div></div> : null}
        <p className="auth-register"><Link href="/">กลับหน้าแรก</Link></p>
      </section>
    </div></main>
  );
}
