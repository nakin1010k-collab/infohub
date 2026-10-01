import { NextResponse } from "next/server";
import { recordArticleAudit } from "@/lib/news/audit";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
type Payload={title?:string;slug?:string;excerpt?:string;content?:string;status?:"draft"|"published"|"archived";categoryId?:string;tags?:string;readingMinutes?:number|string};
const slugify=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const parseTags=(v?:string)=>Array.from(new Set((v??"").split(",").map(x=>x.trim()).filter(Boolean))).slice(0,12);
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 const {data:p}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();if(p?.role!=="editor"&&p?.role!=="admin")return NextResponse.json({error:"forbidden"},{status:403});
 const b=(await request.json()) as Payload;const title=b.title?.trim()??"";const slug=slugify(b.slug||title);const content=b.content?.trim()??"";const categoryId=b.categoryId?.trim()??"";const status=b.status??"draft";
 if(!title||!slug||!content||!categoryId)return NextResponse.json({error:"กรอกหัวข้อ, slug, เนื้อหา และหมวดหมู่ให้ครบ"},{status:400});
 const {data:existing}=await supabase.from("articles").select("published_at,status").eq("id",id).maybeSingle();if(!existing)return NextResponse.json({error:"ไม่พบข่าวนี้"},{status:404});
 const minutes=Number(b.readingMinutes)||Math.max(1,Math.ceil(content.length/600));const publishedAt=status==="published"?(existing.published_at??new Date().toISOString()):null;const canonicalUrl=new URL(`/news/${slug}`,getSiteUrl()).toString();
 const previousStatus=existing.status as "draft"|"published"|"archived";
 const {error}=await supabase.from("articles").update({title,slug,excerpt:b.excerpt?.trim()||null,content,status,canonical_url:canonicalUrl,reading_minutes:minutes,published_at:publishedAt}).eq("id",id);if(error)return NextResponse.json({error:error.message},{status:400});
 const {error:cd}=await supabase.from("article_categories").delete().eq("article_id",id);if(cd)return NextResponse.json({error:cd.message},{status:400});const {error:ci}=await supabase.from("article_categories").insert({article_id:id,category_id:categoryId});if(ci)return NextResponse.json({error:ci.message},{status:400});
 await recordArticleAudit(supabase, id, user.id, "updated", { status, previousStatus });
 if (status !== previousStatus) {
  const action = status === "published" ? "published" : previousStatus === "published" ? "unpublished" : status === "archived" ? "archived" : "updated";
  if (action !== "updated") await recordArticleAudit(supabase, id, user.id, action, { previousStatus, status });
 }
 const {error:td}=await supabase.from("article_tags").delete().eq("article_id",id);if(td)return NextResponse.json({error:td.message},{status:400});
 for(const name of parseTags(b.tags)){const ts=slugify(name);if(!ts)continue;const {data:tag,error:te}=await supabase.from("tags").upsert({slug:ts,name},{onConflict:"slug"}).select("id").single();if(te)return NextResponse.json({error:te.message},{status:400});const {error:le}=await supabase.from("article_tags").insert({article_id:id,tag_id:tag.id});if(le)return NextResponse.json({error:le.message},{status:400});}
 return NextResponse.json({ok:true});
}
