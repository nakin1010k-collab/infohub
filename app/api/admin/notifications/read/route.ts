import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function PATCH(request:Request){
 const body=await request.json().catch(()=>({})) as {id?:string};if(!body.id)return NextResponse.json({error:"missing id"},{status:400});
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 const{error}=await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("id",body.id).eq("recipient_id",user.id);
 if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true});
}