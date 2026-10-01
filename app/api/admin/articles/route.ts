import { NextResponse } from "next/server";
import { tagSlugify } from "@/lib/news/editorial";
import { createAppwriteRow, appwriteQueries, listAllAppwriteRows } from "@/lib/appwrite/database";
import { requireEditor } from "@/lib/appwrite/auth";
import { getSiteUrl } from "@/lib/site-url";
import { checkEditorialQuality } from "@/lib/news/quality";

type Payload = { title?: string; slug?: string; excerpt?: string; content?: string; status?: "draft"|"published"|"archived"; categoryId?: string; tags?: string; readingMinutes?: number|string; imageUrl?: string };
const slugify=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const parseTags=(v?:string)=>Array.from(new Set((v??"").split(",").map(x=>x.trim()).filter(Boolean))).slice(0,12);

export async function POST(request:Request){
 const auth=await requireEditor(); if(!auth.ok)return NextResponse.json({error:auth.reason},{status:auth.reason==="unauthorized"?401:403});
 const b=(await request.json()) as Payload; const title=b.title?.trim()??""; const slug=slugify(b.slug||title); const content=b.content?.trim()??""; const categoryId=b.categoryId?.trim()??""; const status=b.status??"draft";
 if(!title||!slug||!content||!categoryId)return NextResponse.json({error:"กรอกหัวข้อ, slug, เนื้อหา และหมวดหมู่ให้ครบ"},{status:400});
 const minutes=Number(b.readingMinutes)||Math.max(1,Math.ceil(content.length/600)); const imageUrl=b.imageUrl?.trim()||null;
 if(imageUrl){try{const u=new URL(imageUrl);if(u.protocol!=="https:")return NextResponse.json({error:"รูปภาพต้องใช้ HTTPS"},{status:400});}catch{return NextResponse.json({error:"URL รูปภาพไม่ถูกต้อง"},{status:400});}}
 const canonicalUrl=new URL(`/news/${slug}`,getSiteUrl()).toString(); const publishedAt=status==="published"?new Date().toISOString():null;
 const tagPayload=parseTags(b.tags).map(name=>({name,slug:tagSlugify(name)})).filter(tag=>tag.slug);
 if(status==="published"){const quality=checkEditorialQuality({title,excerpt:b.excerpt?.trim()||null,content,canonicalUrl,categoryCount:categoryId?1:0,tagCount:tagPayload.length});if(!quality.ready)return NextResponse.json({error:"ยังเผยแพร่ไม่ได้",quality},{status:422});}
 try {
   const article=await createAppwriteRow("articles",{title,slug,excerpt:b.excerpt?.trim()||null,content,status,category_id:categoryId,reading_minutes:minutes,canonical_url:canonicalUrl,published_at:publishedAt,image_url:imageUrl,created_by:auth.user.$id});
   await createAppwriteRow("article_categories",{article_id:article.$id,category_id:categoryId});
   for(const tag of tagPayload){
     const existing=(await listAllAppwriteRows("tags",[appwriteQueries.queryEqual("slug",tag.slug)],10))[0] ?? await createAppwriteRow("tags",tag);
     await createAppwriteRow("article_tags",{article_id:article.$id,tag_id:existing.$id});
   }
   await createAppwriteRow("audit_logs",{article_id:article.$id,actor_id:auth.user.$id,action:"created",metadata:JSON.stringify({status})});
   if(status==="published") await createAppwriteRow("audit_logs",{article_id:article.$id,actor_id:auth.user.$id,action:"published",metadata:"{}"});
   return NextResponse.json({article:{id:article.$id,slug}},{status:201});
 } catch(error) { console.error("Appwrite article create failed",error); return NextResponse.json({error:error instanceof Error?error.message:"บันทึกข่าวไม่สำเร็จ"},{status:400}); }
}