type UIStateProps = {
  title: string;
  description: string;
  kind?: "loading" | "error" | "empty";
  actionLabel?: string;
  onAction?: () => void;
};

function UIState({ title, description, kind = "empty", actionLabel, onAction }: UIStateProps) {
  const icon = kind === "loading" ? "…" : kind === "error" ? "!" : "⌕";

  return (
    <div
      className={`ui-state ${kind === "error" ? "is-error" : ""}`}
      role={kind === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <span className="state-icon" aria-hidden="true">{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
        {actionLabel && onAction && (
          <button type="button" className="state-action" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <UIState
      kind="loading"
      title="กำลังโหลดข้อมูล"
      description="โปรดรอสักครู่ ระบบกำลังเตรียมเนื้อหาให้คุณ"
    />
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <UIState
      kind="error"
      title="ไม่สามารถโหลดข้อมูลได้"
      description="ลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
      actionLabel={onRetry ? "ลองใหม่" : undefined}
      onAction={onRetry}
    />
  );
}

export function EmptyState() {
  return (
    <UIState
      title="ยังไม่มีข้อมูล"
      description="เมื่อมีเนื้อหาใหม่ ข้อมูลจะแสดงในส่วนนี้"
    />
  );
}
