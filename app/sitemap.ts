import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const base=getSiteUrl().toString().replace(/\/$/,""); const supabase=await createClient();
 const {data}=await supabase.from("articles").select("slug,published_at,updated_at").eq("status","published").order("published_at",{ascending:false});
 return [
  {url:base,changeFrequency:"daily",priority:1},
  {url:base+"/news",changeFrequency:"hourly",priority:.9},
  ...((data??[]).map(a=>({url:base+"/news/"+a.slug,lastModified:a.updated_at??a.published_at??undefined,changeFrequency:"weekly" as const,priority:.8})))
 ];
}