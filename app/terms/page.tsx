import Link from "next/link";

export default function TermsPage() {
  return <main className="auth-page"><div className="auth-shell"><Link className="auth-brand" href="/" aria-label="InfoHub หน้าแรก"><span className="brand-mark" aria-hidden="true">🐱</span><span>InfoHub</span></Link><section className="auth-card" aria-labelledby="terms-title"><div className="auth-intro"><p className="eyebrow">TERMS OF SERVICE</p><h1 id="terms-title">ข้อกำหนดการใช้งาน (Draft)</h1><p>หน้านี้เป็น template สำหรับการส่งมอบโปรเจกต์ ไม่ใช่คำแนะนำทางกฎหมาย และต้องปรับให้ตรงกับธุรกิจ เนื้อหา และเขตอำนาจศาลของผู้ซื้อก่อนเปิดใช้งานจริง</p></div><div className="ui-state"><div><strong>สิ่งที่ต้องกำหนดก่อน production</strong><p>บัญชีผู้ใช้, เนื้อหาที่ผู้ใช้ส่ง, สิทธิ์ในข่าวและภาพ, ข้อจำกัดความรับผิด, การระงับบัญชี, การชำระเงินถ้ามี และช่องทางติดต่อ</p></div></div><p className="auth-register"><Link href="/">กลับหน้าแรก</Link></p></section></div></main>;
}
