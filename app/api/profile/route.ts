import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function PATCH(request: Request){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 const body=await request.json().catch(()=>({})) as {displayName?:string}; const displayName=body.displayName?.trim().slice(0,120)??"";
 const {error}=await supabase.from("profiles").update({display_name:displayName||null}).eq("id",user.id);
 if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({ok:true});
}