import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(request:Request){
 const body=await request.json().catch(()=>({})) as {slug?:string};
 const slug=body.slug?.trim(); if(!slug||slug.length>160)return NextResponse.json({ok:false},{status:400});
 const supabase=await createClient(); const {data:article}=await supabase.from("articles").select("id").eq("slug",slug).eq("status","published").maybeSingle();
 if(!article)return NextResponse.json({ok:false},{status:404});
 const {error}=await supabase.from("analytics_events").insert({event_name:"article_view",article_id:article.id,path:"/news/"+slug});
 if(error)return NextResponse.json({ok:false},{status:400});
 return NextResponse.json({ok:true},{status:201});
}