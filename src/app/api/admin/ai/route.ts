import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiMetrics } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { count, eq, gte, sql } from "drizzle-orm";

export async function GET(){
 const s=await getAdminSession(); if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 const since=new Date(Date.now()-30*24*60*60*1000);
 const rows=await db.select({
   total:count(), successful:sql<number>`sum(case when ${aiMetrics.success} then 1 else 0 end)`,
   failed:sql<number>`sum(case when ${aiMetrics.success} then 0 else 1 end)`,
   rateLimited:sql<number>`sum(case when ${aiMetrics.rateLimited} then 1 else 0 end)`,
   avgLatency:sql<number>`avg(${aiMetrics.latencyMs})`,
 }).from(aiMetrics).where(gte(aiMetrics.createdAt,since));
 return NextResponse.json({metrics:rows[0]||{total:0,successful:0,failed:0,rateLimited:0,avgLatency:0},configured:Boolean(process.env.GROK_API_KEY),model:process.env.GROK_MODEL||"grok-3-mini"});
}