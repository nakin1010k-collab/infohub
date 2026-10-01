import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { tagSlugify } from "@/lib/news/editorial";
import { createAppwriteRow, appwriteQueries, getAppwriteRow, listAllAppwriteRows, updateAppwriteRow } from "@/lib/appwrite/database";
import { requireEditor } from "@/lib/appwrite/auth";
import { getSiteUrl } from "@/lib/site-url";
import { checkEditorialQuality } from "@/lib/news/quality";
type Payload={title?:string;slug?:string;excerpt?:string;content?:string;status?:"draft"|"published"|"archived";categoryId?:string;tags?:string;readingMinutes?:number|string;imageUrl?:string};
const slugify=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const parseTags=(v?:string)=>Array.from(new Set((v??"").split(",").map(x=>x.trim()).filter(Boolean))).slice(0,12);
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const auth=await requireEditor(); if(!auth.ok)return NextResponse.json({error:auth.reason},{status:auth.reason==="unauthorized"?401:403});
 const b=(await request.json()) as Payload; const title=b.title?.trim()??""; const slug=slugify(b.slug||title); const content=b.content?.trim()??""; const categoryId=b.categoryId?.trim()??""; const status=b.status??"draft";
 if(!title||!slug||!content||!categoryId)return NextResponse.json({error:"กรอกหัวข้อ, slug, เนื้อหา และหมวดหมู่ให้ครบ"},{status:400});
 const existing=await getAppwriteRow("articles",id); if(!existing)return NextResponse.json({error:"ไม่พบข่าวนี้"},{status:404});
 const minutes=Number(b.readingMinutes)||Math.max(1,Math.ceil(content.length/600)); const imageUrl=b.imageUrl?.trim()||null; const excerpt=b.excerpt?.trim()??"";
 if(imageUrl){try{const u=new URL(imageUrl);if(u.protocol!=="https:")return NextResponse.json({error:"รูปภาพต้องใช้ HTTPS"},{status:400});}catch{return NextResponse.json({error:"URL รูปภาพไม่ถูกต้อง"},{status:400});}}
 const publishedAt=status==="published"?(existing.published_at ?? new Date().toISOString()):null; const canonicalUrl=new URL(`/news/${slug}`,getSiteUrl()).toString(); const canonicalUrlHash=createHash("sha256").update(canonicalUrl).digest("hex"); const previousStatus=String(existing.status ?? "draft"); const tagPayload=parseTags(b.tags).map(name=>({name,slug:tagSlugify(name)})).filter(tag=>tag.slug);
 if(status==="published"){const quality=checkEditorialQuality({title,excerpt:excerpt||null,content,canonicalUrl,categoryCount:1,tagCount:tagPayload.length});if(!quality.ready)return NextResponse.json({error:"ยังเผยแพร่ไม่ได้",quality},{status:422});}
 try {
   await updateAppwriteRow("articles",id,{title,slug,excerpt,content,status,reading_minutes:minutes,canonical_url:canonicalUrl,canonical_url_hash:canonicalUrlHash,published_at:publishedAt,image_url:imageUrl});
   const oldCats=await listAllAppwriteRows("article_categories",[appwriteQueries.queryEqual("article_id",id)]); for(const row of oldCats) { try { await import("@/lib/appwrite/database").then(m=>m.deleteAppwriteRow("article_categories",String(row.$id))); } catch {} }
   await createAppwriteRow("article_categories",{article_id:id,category_id:categoryId});
   const oldTags=await listAllAppwriteRows("article_tags",[appwriteQueries.queryEqual("article_id",id)]); for(const row of oldTags) { try { await import("@/lib/appwrite/database").then(m=>m.deleteAppwriteRow("article_tags",String(row.$id))); } catch {} }
   for(const tag of tagPayload){const existingTag=(await listAllAppwriteRows("tags",[appwriteQueries.queryEqual("slug",tag.slug)],10))[0] ?? await createAppwriteRow("tags",tag); await createAppwriteRow("article_tags",{article_id:id,tag_id:existingTag.$id});}
   await createAppwriteRow("audit_logs",{article_id:id,actor_id:auth.user.$id,action:"updated",metadata:JSON.stringify({status,previousStatus})});
   if(status!==previousStatus){const action=status==="published"?"published":previousStatus==="published"?"unpublished":status==="archived"?"archived":"updated"; await createAppwriteRow("audit_logs",{article_id:id,actor_id:auth.user.$id,action,metadata:JSON.stringify({previousStatus,status})});}
   return NextResponse.json({ok:true});
 } catch(error){return NextResponse.json({error:error instanceof Error?error.message:"บันทึกการแก้ไขไม่สำเร็จ"},{status:400});}
}