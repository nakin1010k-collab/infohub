import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchFeed } from "@/lib/news/rss";

function slugify(value:string){return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,100);}

export async function GET(request:Request){
 const secret=process.env.CRON_SECRET;
 if(!secret || request.headers.get("authorization")!==`Bearer ${secret}`) return NextResponse.json({error:"unauthorized"},{status:401});
 let supabase;
 try{supabase=createAdminClient();}catch(error){console.error("[cron/ingest] admin client unavailable",error);return NextResponse.json({error:"scheduled ingestion is not configured"},{status:503});}
 const {data:sources,error}=await supabase.from("sources").select("id,name,feed_url").eq("is_active",true).not("feed_url","is",null);
 if(error){console.error("[cron/ingest] source lookup failed",error);return NextResponse.json({error:"scheduled ingestion is temporarily unavailable"},{status:503});}
 const results=[];
 for(const source of sources??[]){
  const stale=new Date(Date.now()-30*60*1000).toISOString();
  await supabase.from("ingestion_runs").update({status:"failed",error_message:"Timed out before scheduled run",finished_at:new Date().toISOString()}).eq("source_id",source.id).eq("status","running").lt("started_at",stale);
  const {data:run,error:runError}=await supabase.from("ingestion_runs").insert({source_id:source.id,status:"running"}).select("id").single();
  if(runError||!run){results.push({source:source.name,status:"busy_or_failed"});continue;}
  try{
   const items=await fetchFeed(source.feed_url as string);let created=0,duplicates=0,failed=0;const details=[];
   for(const item of items){
    try{
     const {data:existing}=await supabase.from("articles").select("id").eq("canonical_url",item.url).maybeSingle();
     if(existing){duplicates++;details.push({url:item.url,title:item.title.slice(0,180),outcome:"duplicate"});continue;}
     const {data:article,error:insertError}=await supabase.from("articles").insert({source_id:source.id,author_name:item.authorName,title:item.title,slug:(slugify(item.title)||"imported")+"-"+crypto.randomUUID().slice(0,8),excerpt:item.excerpt||null,content:item.excerpt||null,status:"draft",canonical_url:item.url,reading_minutes:Math.max(1,Math.ceil((item.excerpt||item.title).length/600)),published_at:null}).select("id").single();
     if(insertError||!article)throw insertError??new Error("insert failed");
     created++;details.push({url:item.url,title:item.title.slice(0,180),outcome:"created"});
     await supabase.from("article_audit_logs").insert({article_id:article.id,actor_id:null,action:"imported",metadata:{source:source.name,mode:"scheduled"}});
    }catch(error){failed++;details.push({url:item.url,title:item.title.slice(0,180),outcome:"failed",reason:(error instanceof Error?error.message:"Unknown error").slice(0,300)});}
   }
   const status=failed?(created?"partial":"failed"):"success";
   await supabase.from("ingestion_runs").update({status,items_seen:items.length,items_created:created,items_skipped:duplicates,items_failed:failed,error_message:failed?`Scheduled import failed for ${failed} item(s)`:null,item_details:details.slice(0,500),failure_details:details.filter((x)=>x.outcome==="failed").slice(0,50),finished_at:new Date().toISOString()}).eq("id",run.id);
   if(failed)await supabase.rpc("notify_ingestion_failure",{p_actor_id:null,p_source_name:source.name,p_run_id:run.id,p_message:`Scheduled import failed for ${failed} item(s)`});
   if(status!=="failed")await supabase.from("sources").update({last_ingested_at:new Date().toISOString()}).eq("id",source.id);
   results.push({source:source.name,status,itemsSeen:items.length,itemsCreated:created,duplicates,failed});
  }catch(error){
   console.error("[cron/ingest] source run failed",{sourceId:source.id,error});
   await supabase.from("ingestion_runs").update({status:"failed",error_message:"Scheduled feed import failed",finished_at:new Date().toISOString()}).eq("id",run.id);
   await supabase.rpc("notify_ingestion_failure",{p_actor_id:null,p_source_name:source.name,p_run_id:run.id,p_message:"Scheduled feed import failed"});
   results.push({source:source.name,status:"failed"});
  }
 }
 return NextResponse.json({ok:true,scheduled:true,results});
}
