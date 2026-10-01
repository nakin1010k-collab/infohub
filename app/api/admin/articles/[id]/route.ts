import { NextResponse } from "next/server";
import { tagSlugify } from "@/lib/news/editorial";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { checkEditorialQuality } from "@/lib/news/quality";
type Payload={title?:string;slug?:string;excerpt?:string;content?:string;status?:"draft"|"published"|"archived";categoryId?:string;tags?:string;readingMinutes?:number|string;imageUrl?:string};
const slugify=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const parseTags=(v?:string)=>Array.from(new Set((v??"").split(",").map(x=>x.trim()).filter(Boolean))).slice(0,12);
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 const {data:p}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();if(p?.role!=="editor"&&p?.role!=="admin")return NextResponse.json({error:"forbidden"},{status:403});
 const b=(await request.json()) as Payload;const title=b.title?.trim()??"";const slug=slugify(b.slug||title);const content=b.content?.trim()??"";const categoryId=b.categoryId?.trim()??"";const status=b.status??"draft";
 if(!title||!slug||!content||!categoryId)return NextResponse.json({error:"กรอกหัวข้อ, slug, เนื้อหา และหมวดหมู่ให้ครบ"},{status:400});
 const {data:existing}=await supabase.from("articles").select("published_at,status").eq("id",id).maybeSingle();if(!existing)return NextResponse.json({error:"ไม่พบข่าวนี้"},{status:404});
 const minutes=Number(b.readingMinutes)||Math.max(1,Math.ceil(content.length/600));
 const imageUrl=b.imageUrl?.trim()||null;
 if(imageUrl){try{const u=new URL(imageUrl);if(u.protocol!=="https:")return NextResponse.json({error:"รูปภาพต้องใช้ HTTPS"},{status:400});}catch{return NextResponse.json({error:"URL รูปภาพไม่ถูกต้อง"},{status:400});}}
 const publishedAt=status==="published"?(existing.published_at??new Date().toISOString()):null;const canonicalUrl=new URL(`/news/${slug}`,getSiteUrl()).toString();
 const previousStatus=existing.status as "draft"|"published"|"archived";
 const tagPayload = parseTags(b.tags).map((name) => ({ name, slug: tagSlugify(name) })).filter((tag) => tag.slug);
 if(status==="published"){const quality=checkEditorialQuality({title,excerpt:b.excerpt?.trim()||null,content,canonicalUrl,categoryCount:categoryId?1:0,tagCount:tagPayload.length});if(!quality.ready)return NextResponse.json({error:"ยังเผยแพร่ไม่ได้",quality},{status:422});}
 const { error } = await supabase.rpc("admin_update_article", {
  p_actor_id: user.id,
  p_article_id: id,
  p_title: title,
  p_slug: slug,
  p_excerpt: b.excerpt?.trim() || null,
  p_content: content,
  p_status: status,
  p_category_id: categoryId,
  p_tags: tagPayload,
  p_reading_minutes: minutes,
  p_canonical_url: canonicalUrl,
  p_published_at: publishedAt,
  p_previous_status: previousStatus,
  p_image_url: imageUrl,
 });
 if(error) return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true});
}
