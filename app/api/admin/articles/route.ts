import { NextResponse } from "next/server";
import { recordArticleAudit } from "@/lib/news/audit";
import { tagSlugify } from "@/lib/news/editorial";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

type Payload = { title?: string; slug?: string; excerpt?: string; content?: string; status?: "draft"|"published"|"archived"; categoryId?: string; tags?: string; readingMinutes?: number|string };
const slugify=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const parseTags=(v?:string)=>Array.from(new Set((v??"").split(",").map(x=>x.trim()).filter(Boolean))).slice(0,12);

async function editorClient(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {supabase,user:null,role:null};const {data:p}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();return {supabase,user,role:p?.role??null};}

export async function POST(request:Request){
 const {supabase,user,role}=await editorClient(); if(!user)return NextResponse.json({error:"unauthorized"},{status:401}); if(role!=="editor"&&role!=="admin")return NextResponse.json({error:"forbidden"},{status:403});
 const b=(await request.json()) as Payload; const title=b.title?.trim()??""; const slug=slugify(b.slug||title); const content=b.content?.trim()??""; const categoryId=b.categoryId?.trim()??""; const status=b.status??"draft";
 if(!title||!slug||!content||!categoryId)return NextResponse.json({error:"กรอกหัวข้อ, slug, เนื้อหา และหมวดหมู่ให้ครบ"},{status:400});
 const minutes=Number(b.readingMinutes)||Math.max(1,Math.ceil(content.length/600)); const canonicalUrl=new URL(`/news/${slug}`,getSiteUrl()).toString(); const publishedAt=status==="published"?new Date().toISOString():null;
 const {data:article,error}=await supabase.from("articles").insert({title,slug,excerpt:b.excerpt?.trim()||null,content,status,canonical_url:canonicalUrl,reading_minutes:minutes,published_at:publishedAt}).select("id,slug").single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 const {error:ce}=await supabase.from("article_categories").insert({article_id:article.id,category_id:categoryId}); if(ce)return NextResponse.json({error:ce.message},{status:400});
 await recordArticleAudit(supabase, article.id, user.id, "created", { status });
 if(status==="published") await recordArticleAudit(supabase, article.id, user.id, "published", {});
 for(const name of parseTags(b.tags)){const ts=tagSlugify(name);if(!ts)continue;const {data:tag,error:te}=await supabase.from("tags").upsert({slug:ts,name},{onConflict:"slug"}).select("id").single();if(te)return NextResponse.json({error:te.message},{status:400});const {error:le}=await supabase.from("article_tags").insert({article_id:article.id,tag_id:tag.id});if(le)return NextResponse.json({error:le.message},{status:400});}
 return NextResponse.json({article},{status:201});
}
