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
      <strong>ระบบข้อมูลยังไม่พร้อมใช้งาน</strong>
      <p style={{ margin: "6px 0 0" }}>
        หน้าเว็บยังเปิดใช้งานได้ แต่ไม่สามารถอ่านฐานข้อมูลข่าวจาก Appwrite ได้ในขณะนี้
        กรุณาตรวจสอบการเชื่อมต่อ Appwrite · <a href="/status">ดูสถานะระบบ</a>
      </p>
    </div>
  );
}
