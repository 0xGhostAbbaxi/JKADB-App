import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { permissions, rolePermissions } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";

export async function GET(){
 const s=await getAdminSession(); if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [ps,rp]=await Promise.all([db.select().from(permissions).orderBy(asc(permissions.groupName),asc(permissions.label)),db.select().from(rolePermissions)]);
 return NextResponse.json({permissions:ps,rolePermissions:rp,roles:["super_admin","district_admin","reviewer","complaint_officer"]});
}
export async function POST(req:NextRequest){
 const s=await getAdminSession(); if(!s||s.role!=="super_admin")return NextResponse.json({error:"Forbidden"},{status:403});
 const b=await req.json(); const role=b.role; const ids=Array.isArray(b.permissionIds)?b.permissionIds:[];
 await db.delete(rolePermissions).where(eq(rolePermissions.role,role));
 if(ids.length) await db.insert(rolePermissions).values(ids.map((permissionId:string)=>({role,permissionId})));
 return NextResponse.json({success:true});
}