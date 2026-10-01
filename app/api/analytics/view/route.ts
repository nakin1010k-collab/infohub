import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request:Request){
 const contentType=request.headers.get("content-type")??"";
 if(!contentType.toLowerCase().includes("application/json")) return NextResponse.json({ok:false},{status:415});
 const body=await request.json().catch(()=>({})) as {slug?:string};
 const slug=body.slug?.trim();
 if(!slug||slug.length>160)return NextResponse.json({ok:false},{status:400});
 const supabase=await createClient();
 const {data:article}=await supabase.from("articles").select("id").eq("slug",slug).eq("status","published").maybeSingle();
 if(!article)return NextResponse.json({ok:false},{status:404});
 const path="/news/"+slug;
 const recentCutoff=new Date(Date.now()-30*1000).toISOString();
 const {data:recent,error:recentError}=await supabase.from("analytics_events").select("id").eq("event_name","article_view").eq("article_id",article.id).eq("path",path).gte("created_at",recentCutoff).limit(1);
 if(recentError){console.error("[analytics/view] duplicate check failed",recentError);return NextResponse.json({ok:false},{status:503});}
 if(recent?.length)return NextResponse.json({ok:true,deduplicated:true},{status:200});
 const {error}=await supabase.from("analytics_events").insert({event_name:"article_view",article_id:article.id,path});
 if(error){console.error("[analytics/view] insert failed",error);return NextResponse.json({ok:false},{status:503});}
 return NextResponse.json({ok:true},{status:201});
}
