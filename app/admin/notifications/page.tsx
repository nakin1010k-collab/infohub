import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEditor } from "@/lib/appwrite/admin";
import { appwriteQueries, listAllAppwriteRows } from "@/lib/appwrite/database";
import NotificationActions from "./notification-actions";

export default async function NotificationsPage() {
  const auth = await getCurrentEditor();
  if (!auth.ok) redirect(auth.reason === "unauthorized" ? "/login?next=/admin/notifications" : "/dashboard");
  let data: Record<string, unknown>[] = [];
  let error: Error | null = null;
  try {
    data = await listAllAppwriteRows("notifications", [appwriteQueries.queryOrderDesc("created_at")], 100);
  } catch (e) {
    error = e instanceof Error ? e : new Error("โหลดแจ้งเตือนไม่สำเร็จ");
  }
  return <main className="auth-page"><div className="auth-shell admin-shell"><section className="auth-card admin-card"><div className="admin-heading-row"><div><p className="eyebrow">NOTIFICATIONS</p><h1>แจ้งเตือนระบบ</h1><p>ประวัติการแจ้งเตือน RSS และระบบ</p></div><Link className="state-action" href="/admin">กลับ CMS</Link></div>{error?<div className="ui-state is-error"><div><strong>โหลดแจ้งเตือนไม่สำเร็จ</strong><p>{error.message}</p></div></div>:<div className="news-list">{data.length?data.map(n=><article className="news-card admin-news-card" key={String(n.$id)}><div className="news-meta"><span className="tag">{n.read_at?"อ่านแล้ว":"ใหม่"}</span><span>{n.created_at?new Date(String(n.created_at)).toLocaleString("th-TH"):""}</span></div><h2>{String(n.title??"")}</h2><p>{String(n.message??"")}</p><NotificationActions id={String(n.$id)} read={Boolean(n.read_at)} /></article>):<div className="ui-state"><div><strong>ยังไม่มีแจ้งเตือน</strong></div></div>}</div>}</section></div></main>;
}
