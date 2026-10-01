"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function NotificationActions({id,read}:{id:string;read:boolean}){
 const [busy,setBusy]=useState(false);const router=useRouter();if(read)return null;
 async function mark(){setBusy(true);await fetch("/api/admin/notifications/read",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});setBusy(false);router.refresh();}
 return <button className="state-action" disabled={busy} onClick={mark}>{busy?"กำลังบันทึก…":"ทำเครื่องหมายว่าอ่านแล้ว"}</button>;
}