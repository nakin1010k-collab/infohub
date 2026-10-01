export function PublicDataNotice() {
  return (
    <div
      role="status"
      style={{
        margin: "0 0 24px",
        padding: "14px 16px",
        border: "1px solid rgba(180, 120, 20, 0.35)",
        borderRadius: "14px",
        background: "rgba(255, 190, 70, 0.08)",
      }}
    >
      <strong>ระบบข้อมูลกำลังเชื่อมต่อใหม่</strong>
      <p style={{ margin: "6px 0 0" }}>
        หน้าเว็บยังเปิดใช้งานได้ แต่ข้อมูลข่าวจากฐานข้อมูลยังไม่พร้อมในขณะนี้
        ทีมระบบสามารถตรวจสอบต่อได้จาก <a href="/api/health">สถานะระบบ</a>
      </p>
    </div>
  );
}
