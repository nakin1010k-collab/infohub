"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ProfileForm({ initialName }: { initialName: string }) {
  const [name,setName]=useState(initialName); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
  async function save(){setBusy(true);setMessage("");const r=await fetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({displayName:name})});const d=await r.json().catch(()=>({}));setBusy(false);setMessage(r.ok?"บันทึกโปรไฟล์แล้ว":d.error||"บันทึกไม่สำเร็จ");if(r.ok)router.refresh();}
  return <div className="profile-actions"><label>ชื่อที่แสดง<input value={name} onChange={e=>setName(e.target.value)} maxLength={120} /></label><button className="primary-button" disabled={busy} onClick={save}>{busy?"กำลังบันทึก…":"บันทึกโปรไฟล์"}</button>{message?<p className="field-hint" role="status">{message}</p>:null}</div>;
}