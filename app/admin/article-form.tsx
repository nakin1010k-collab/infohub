"use client";
import {FormEvent,useState} from "react";import {useRouter} from "next/navigation";
type Category={id:string;name:string;slug:string};type Initial={id:string;title:string;slug:string;excerpt:string;content:string;status:"draft"|"published"|"archived";reading_minutes:number|null;categoryId:string;tags:string};
export default function ArticleForm({categories,initial}:{categories:Category[];initial?:Initial}){
 const router=useRouter();const[busy,setBusy]=useState(false);const[error,setError]=useState("");const[f,setF]=useState({title:initial?.title??"",slug:initial?.slug??"",excerpt:initial?.excerpt??"",content:initial?.content??"",status:initial?.status??"draft",categoryId:initial?.categoryId??categories[0]?.id??"",tags:initial?.tags??"",readingMinutes:initial?.reading_minutes?.toString()??""});
 const set=(k:keyof typeof f,v:string)=>setF(x=>({...x,[k]:v}));
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");const r=await fetch(initial?`/api/admin/articles/${initial.id}`:"/api/admin/articles",{method:initial?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});const j=await r.json().catch(()=>({}));if(!r.ok){setError(j.error||"บันทึกไม่สำเร็จ");setBusy(false);return}router.push("/admin");router.refresh()}
 return <form className="admin-form" onSubmit={submit}>{error&&<div className="ui-state is-error"><div><strong>บันทึกไม่สำเร็จ</strong><p>{error}</p></div></div>}
 <label>หัวข้อ<input required value={f.title} onChange={e=>set("title",e.target.value)}/></label>
 <label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={f.slug} onChange={e=>set("slug",e.target.value)}/><span>ภาษาอังกฤษตัวเล็ก ตัวเลข และ -</span></label>
 <label>หมวดหมู่<select required value={f.categoryId} onChange={e=>set("categoryId",e.target.value)}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label>สถานะ<select value={f.status} onChange={e=>set("status",e.target.value)}><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่</option><option value="archived">เก็บถาวร</option></select></label>
 <label>คำโปรย<textarea rows={3} value={f.excerpt} onChange={e=>set("excerpt",e.target.value)}/></label>
 <label>เนื้อหา<textarea required rows={14} value={f.content} onChange={e=>set("content",e.target.value)}/></label>
 <label>Tags<input value={f.tags} onChange={e=>set("tags",e.target.value)}/><span>คั่นด้วย comma เช่น technology, innovation</span></label>
 <label>เวลาอ่าน (นาที)<input type="number" min="1" value={f.readingMinutes} onChange={e=>set("readingMinutes",e.target.value)}/></label>
 <div className="admin-form-actions"><button className="primary-button" disabled={busy}>{busy?"กำลังบันทึก…":initial?"บันทึกการแก้ไข":"สร้างข่าว"}</button><button type="button" className="state-action" onClick={()=>router.push("/admin")}>ยกเลิก</button></div>
 </form>;
}
