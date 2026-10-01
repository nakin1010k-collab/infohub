"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QueueActions({ id, slug }: { id: string; slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function enrich() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/ai/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: id }),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    setMessage(response.ok ? "AI ช่วยร่างให้แล้ว ตรวจผลในหน้าแก้ไขก่อนบันทึก" : result.error || "AI ช่วยร่างไม่สำเร็จ");
    if (response.ok) router.push("/admin/" + id);
  }

  async function publish() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/articles/" + id + "/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(result.error || "เผยแพร่ไม่สำเร็จ");
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-actions">
      <a className="state-action" href={"/admin/" + id}>แก้ไข</a>
      <a className="state-action" href={"/admin/" + id + "/preview"}>Preview</a>
      <button className="state-action" disabled={busy} onClick={enrich}>✨ AI ช่วยร่าง</button>
      <button className="primary-button" disabled={busy} onClick={publish}>เผยแพร่</button>
      {message ? <span className="field-hint">{message}</span> : null}
    </div>
  );
}
