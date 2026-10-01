"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function changeStatus(nextStatus: "draft" | "published" | "archived") {
    setBusy(true);
    const response = await fetch(`/api/admin/articles/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setBusy(false);
    if (response.ok) router.refresh();
  }

  return (
    <div className="admin-actions">
      <a className="state-action" href={`/news/${id}`} aria-label="เปิดข่าว">ดู</a>
      <a className="state-action" href={`/admin/${id}`}>แก้ไข</a>
      {status !== "published" && <button className="state-action" disabled={busy} onClick={() => changeStatus("published")}>เผยแพร่</button>}
      {status === "published" && <button className="state-action" disabled={busy} onClick={() => changeStatus("draft")}>ถอนเผยแพร่</button>}
      {status !== "archived" && <button className="state-action" disabled={busy} onClick={() => changeStatus("archived")}>เก็บถาวร</button>}
    </div>
  );
}
