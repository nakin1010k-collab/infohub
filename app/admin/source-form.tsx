"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SourceForm({ id, feedUrl, isActive }: { id: string; feedUrl: string | null; isActive: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState(feedUrl ?? "");
  const [active, setActive] = useState(isActive);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/admin/sources/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedUrl: url, isActive: active }),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    setMessage(response.ok ? "บันทึกแล้ว" : result.error || "บันทึกไม่สำเร็จ");
    if (response.ok) router.refresh();
  }

  async function ingest() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/admin/ingest", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: id }),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    setMessage(response.ok ? `นำเข้าแล้ว ${result.itemsCreated ?? 0} ข่าว จาก ${result.itemsSeen ?? 0} รายการ` : result.error || "นำเข้าไม่สำเร็จ");
    if (response.ok) router.refresh();
  }

  return <div className="source-form">
    <label>RSS / Atom Feed URL<input type="url" placeholder="https://example.com/feed.xml" value={url} onChange={e => setUrl(e.target.value)} /></label>
    <label className="source-active"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> เปิดใช้งานแหล่งข่าว</label>
    <div className="admin-actions"><button className="state-action" disabled={busy} onClick={save}>บันทึก</button><button className="primary-button" disabled={busy || !url} onClick={ingest}>นำเข้าข่าวตอนนี้</button></div>
    {message && <p className="field-hint">{message}</p>}
  </div>;
}
