export function PublicDataNotice() {
  return (
    <div role="status" style={{ margin: "0 0 24px", padding: "14px 16px", border: "1px solid rgba(180, 120, 20, 0.35)", borderRadius: "14px", background: "rgba(255, 190, 70, 0.08)" }}>
      <strong>ระบบข้อมูลยังไม่ได้เชื่อมต่อ</strong>
      <p style={{ margin: "6px 0 0" }}>
        หน้าเว็บยังเปิดใช้งานได้ แต่ฐานข้อมูลข่าวยังไม่พร้อมในขณะนี้
        โปรดตั้งค่า Supabase ก่อนใช้งานข้อมูลจริง · <a href="/status">ดูสถานะระบบ</a>
      </p>
    </div>
  );
}
