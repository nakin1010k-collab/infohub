import Link from "next/link";

export default function PrivacyPage() {
  return <main className="auth-page"><div className="auth-shell"><Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link><section className="auth-card" aria-labelledby="privacy-title"><div className="auth-intro"><p className="eyebrow">PRIVACY POLICY</p><h1 id="privacy-title">นโยบายความเป็นส่วนตัว (Draft)</h1><p>หน้านี้เป็น template สำหรับการส่งมอบโปรเจกต์ ไม่ใช่คำแนะนำทางกฎหมาย และต้องปรับให้ตรงกับผู้ให้บริการ ข้อมูลที่เก็บ และกฎหมายของผู้ซื้อก่อนเปิดใช้งานจริง</p></div><div className="ui-state"><div><strong>สิ่งที่ต้องกำหนดก่อน production</strong><p>ประเภทข้อมูลผู้ใช้, ระยะเวลาจัดเก็บ, analytics, cookies, ผู้ประมวลผลข้อมูล, ช่องทางติดต่อ, การลบข้อมูล และข้อกำหนดตามเขตอำนาจศาลที่เกี่ยวข้อง</p></div></div><p className="auth-register"><Link href="/">กลับหน้าแรก</Link></p></section></div></main>;
}
