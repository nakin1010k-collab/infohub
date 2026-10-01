"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SourceForm({ id, feedUrl, isActive, retryStatus }: { id: string; feedUrl: string | null; isActive: boolean; retryStatus?: "failed" | "partial" | null }) {
  const router = useRouter();
  const [url, setUrl] = useState(feedUrl ?? "");
  const [active, setActive] = useState(isActive);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [aiImport, setAiImport] = useState(false);
  const [progress, setProgress] = useState("");

  async function save() {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/admin/sources/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feedUrl: url, isActive: active }) });
    const result = await response.json().catch(() => ({}));
    setBusy(false); setMessage(response.ok ? "บันทึกแล้ว" : result.error || "บันทึกไม่สำเร็จ");
    if (response.ok) router.refresh();
  }

  async function ingest(retry = false) {
    setBusy(true); setMessage(""); setProgress("กำลังดึง RSS และตรวจรายการข่าว…");
    try {
      const response = await fetch("/api/admin/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: id, enrich: aiImport, retry }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        const statusText = result.status === "partial" ? "นำเข้าได้บางส่วน" : "นำเข้าสำเร็จ";
        setMessage(`${statusText}: สร้างใหม่ ${result.itemsCreated ?? 0} ข่าว · ข้ามข่าวซ้ำ ${result.skippedDuplicates ?? 0} · ล้มเหลว ${result.failedItems ?? result.errors?.length ?? 0} · ตรวจทั้งหมด ${result.itemsSeen ?? 0} รายการ · จัดหมวด/แท็ก ${result.ruleEnriched ?? 0} ข่าว${aiImport ? ` · AI ช่วยร่าง ${result.aiEnriched ?? 0} ข่าว` : ""}`);
        router.refresh();
      } else {
        setMessage(response.status === 409 ? "แหล่งข่าวนี้กำลังนำเข้าอยู่ กรุณารอรอบปัจจุบันให้เสร็จก่อน" : result.error || "นำเข้าไม่สำเร็จ");
      }
    } catch {
      setMessage("เชื่อมต่อระบบนำเข้าไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return <div className="source-form">
    <label>RSS / Atom Feed URL<input type="url" placeholder="https://example.com/feed.xml" value={url} onChange={e => setUrl(e.target.value)} /></label>
    <label className="source-active"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> เปิดใช้งานแหล่งข่าว</label>
    <div className="admin-actions"><button className="state-action" disabled={busy} onClick={save}>บันทึก</button><button className="primary-button" disabled={busy || !url} onClick={() => ingest(false)}>{busy ? "กำลังนำเข้า…" : "นำเข้าข่าวตอนนี้"}</button>{retryStatus ? <button className="state-action" disabled={busy || !url} onClick={() => ingest(true)}>↻ ลองนำเข้าใหม่ ({retryStatus === "partial" ? "บางส่วน" : "ล้มเหลว"})</button> : null}</div>
    {progress && <p className="field-hint" role="status" aria-live="polite">{progress}</p>}
    <label className="source-active"><input type="checkbox" checked={aiImport} onChange={e => setAiImport(e.target.checked)} /> ใช้ AI ช่วยร่างเพิ่มเติม (ไม่จำเป็น)</label>
    <p className="field-hint">การนำเข้าและจัดหมวด/แท็กพื้นฐานทำงานได้โดยไม่ต้องมี OpenAI API และข่าวจะยังเป็นฉบับร่างเสมอ</p>
    {message && <p className="field-hint">{message}</p>}
  </div>;
}
