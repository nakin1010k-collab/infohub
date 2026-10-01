import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const labels: Record<string,string> = { created:"สร้างข่าว", updated:"แก้ไขข่าว", ai_enriched:"AI ช่วยร่าง", published:"เผยแพร่", unpublished:"นำออกจากเผยแพร่", archived:"เก็บถาวร", imported:"นำเข้าจากแหล่งข่าว" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ action?: string; days?: string }> }) {
  const params = await searchParams;
  const action = ["all", ...Object.keys(labels)].includes(params.action ?? "") ? (params.action ?? "all") : "all";
  const days = ["1","7","30","all"].includes(params.days ?? "") ? (params.days ?? "7") : "7";
  const supabase = await createClient();
  const { data:{user} } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/activity");
  const { data:profile } = await supabase.from("profiles").select("role,display_name").eq("id",user.id).maybeSingle();
  if (!profile || !["editor","admin"].includes(profile.role)) redirect("/dashboard");
  let request = supabase.from("article_audit_logs").select("id,article_id,action,metadata,created_at,actor:profiles(display_name),article:articles(title,slug)").order("created_at",{ascending:false}).limit(100);
  if (action !== "all") request = request.eq("action",action);
  if (days !== "all") request = request.gte("created_at",new Date(Date.now()-Number(days)*86400000).toISOString());
  const {data:logs,error}=await request;
  return <main className="auth-page"><div className="auth-shell admin-shell"><Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link>
    <section className="auth-card admin-card" aria-labelledby="activity-title"><div className="auth-intro"><div className="admin-heading-row">
      <div><p className="eyebrow">EDITORIAL ACTIVITY</p><h1 id="activity-title">กิจกรรมกองบรรณาธิการ</h1><p>ดูประวัติการทำงานล่าสุดของข่าวทั้งหมดในระบบ</p></div>
      <div className="admin-heading-actions"><Link className="state-action" href="/admin/queue">คิวตรวจ</Link><Link className="primary-button" href="/admin">CMS</Link></div>
    </div></div>
    <form className="admin-filters" method="get"><select name="action" defaultValue={action} aria-label="กรองกิจกรรม"><option value="all">ทุกกิจกรรม</option>{Object.entries(labels).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select>
      <select name="days" defaultValue={days} aria-label="ช่วงเวลา"><option value="1">24 ชั่วโมง</option><option value="7">7 วัน</option><option value="30">30 วัน</option><option value="all">ทั้งหมด</option></select><button className="state-action" type="submit">กรอง</button>{(action!=="all"||days!=="7")&&<Link className="state-action" href="/admin/activity">ล้าง</Link>}</form>
    <div className="ui-state"><div><strong>{error ? "โหลดกิจกรรมไม่สำเร็จ" : "พบ " + (logs?.length ?? 0) + " เหตุการณ์"}</strong><p>{error ? "ตรวจสอบ migration article_audit_logs ก่อน" : "แสดงสูงสุด 100 เหตุการณ์ล่าสุด"}</p></div></div>
    {!error&&logs?.length ? <div className="audit-list activity-list">{logs.map(log=><article className="activity-card" key={log.id}><div><span className="tag">{labels[log.action]??log.action}</span><h2>{log.article?.[0]?.title??"ไม่พบบทความ"}</h2><p>{log.actor?.[0]?.display_name??"ผู้ใช้"} · {new Date(log.created_at).toLocaleString("th-TH")}</p></div>{log.article?.[0]?.slug ? <Link className="state-action" href={"/admin/"+log.article_id}>เปิดข่าว</Link> : null}</article>)}</div> : !error ? <div className="ui-state"><div><strong>ยังไม่มีกิจกรรม</strong><p>เมื่อมีการสร้าง นำเข้า AI หรือเผยแพร่ข่าว กิจกรรมจะปรากฏที่นี่</p></div></div> : null}
    <p className="auth-register"><Link href="/admin">กลับ CMS</Link> · <Link href="/admin/sources">แหล่งข่าว</Link></p></section></div></main>;
}