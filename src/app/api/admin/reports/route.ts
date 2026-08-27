import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, categories, departments } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { count, eq, sql } from "drizzle-orm";

export async function GET(req:NextRequest){
 const s=await getAdminSession(); if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 const type=new URL(req.url).searchParams.get("type")||"summary";
 if(type==="categories"){
  const rows=await db.select({category:categories.nameEn,total:count(complaints.id)}).from(complaints).leftJoin(categories,eq(complaints.categoryId,categories.id)).where(eq(complaints.isDraft,false)).groupBy(categories.nameEn).orderBy(sql`count(${complaints.id}) desc`);
  return NextResponse.json({rows});
 }
 if(type==="departments"){
  const rows=await db.select({department:departments.nameEn,total:count(complaints.id),resolved:sql<number>`sum(case when ${complaints.status} in ('resolved','closed') then 1 else 0 end)`}).from(complaints).leftJoin(departments,eq(complaints.departmentId,departments.id)).where(eq(complaints.isDraft,false)).groupBy(departments.nameEn).orderBy(sql`count(${complaints.id}) desc`);
  return NextResponse.json({rows});
 }
 const [r]=await db.select({total:count(),resolved:sql<number>`sum(case when ${complaints.status} in ('resolved','closed') then 1 else 0 end)`,overdue:sql<number>`sum(case when ${complaints.slaStatus}='overdue' then 1 else 0 end)`}).from(complaints).where(eq(complaints.isDraft,false));
 return NextResponse.json({summary:r});
}