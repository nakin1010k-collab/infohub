"use client";
import { useEffect } from "react";
export default function ArticleViewTracker({slug}:{slug:string}){
 useEffect(()=>{void fetch("/api/analytics/view",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug})});},[slug]);
 return null;
}