import { NextResponse } from "next/server";
import { tagSlugify } from "@/lib/news/editorial";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { checkEditorialQuality } from "@/lib/news/quality";

type Payload = { title?: string; slug?: string; excerpt?: string; content?: string; status?: "draft"|"published"|"archived"; categoryId?: string; tags?: string; readingMinutes?: number|string };
const slugify=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const parseTags=(v?:string)=>Array.from(new Set((v??"").split(",").map(x=>x.trim()).filter(Boolean))).slice(0,12);

async function editorClient(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {supabase,user:null,role:null};const {data:p}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();return {supabase,user,role:p?.role??null};}

export async function POST(request:Request){
 const {supabase,user,role}=await editorClient(); if(!user)return NextResponse.json({error:"unauthorized"},{status:401}); if(role!=="editor"&&role!=="admin")return NextResponse.json({error:"forbidden"},{status:403});
 const b=(await request.json()) as Payload; const title=b.title?.trim()??""; const slug=slugify(b.slug||title); const content=b.content?.trim()??""; const categoryId=b.categoryId?.trim()??""; const status=b.status??"draft";
 if(!title||!slug||!content||!categoryId)return NextResponse.json({error:"กรอกหัวข้อ, slug, เนื้อหา และหมวดหมู่ให้ครบ"},{status:400});
 const minutes=Number(b.readingMinutes)||Math.max(1,Math.ceil(content.length/600)); const canonicalUrl=new URL(`/news/${slug}`,getSiteUrl()).toString(); const publishedAt=status==="published"?new Date().toISOString():null;
 const tagPayload=parseTags(b.tags).map(name=>({name,slug:tagSlugify(name)})).filter(tag=>tag.slug);
 if(status==="published"){const quality=checkEditorialQuality({title,excerpt:b.excerpt?.trim()||null,content,canonicalUrl,categoryCount:categoryId?1:0,tagCount:tagPayload.length});if(!quality.ready)return NextResponse.json({error:"ยังเผยแพร่ไม่ได้",quality},{status:422});}
 const {data:articleId,error}=await supabase.rpc("admin_create_article",{p_actor_id:user.id,p_title:title,p_slug:slug,p_excerpt:b.excerpt?.trim()||null,p_content:content,p_status:status,p_category_id:categoryId,p_tags:tagPayload,p_reading_minutes:minutes,p_canonical_url:canonicalUrl,p_published_at:publishedAt});
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({article:{id:articleId,slug}},{status:201});
}
