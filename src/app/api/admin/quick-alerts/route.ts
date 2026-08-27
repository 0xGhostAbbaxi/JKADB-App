import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quickAlerts } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { and, eq, lte, gte, or } from "drizzle-orm";

export async function GET() {
  const now = new Date();
  const rows = await db.select().from(quickAlerts).where(or(eq(quickAlerts.isActive,true), and(lte(quickAlerts.startsAt,now), gte(quickAlerts.endsAt,now))));
  return NextResponse.json({alerts:rows});
}
export async function POST(req:NextRequest){
  const session=await getAdminSession(); if(!session||!["super_admin","district_admin"].includes(session.role)) return NextResponse.json({error:"Forbidden"},{status:403});
  try{const b=await req.json(); const [row]=await db.insert(quickAlerts).values({
    titleEn:String(b.titleEn||"").trim(), titleUr:b.titleUr||null, messageEn:String(b.messageEn||"").trim(), messageUr:b.messageUr||null,
    priority:b.priority||"urgent", displayMode:b.displayMode||"banner", startsAt:b.startsAt?new Date(b.startsAt):null, endsAt:b.endsAt?new Date(b.endsAt):null,
    isActive:Boolean(b.isActive), createdBy:session.id,
  }).returning(); await writeAudit(session,"quick_alert_create","quick_alert",row.id,row.titleEn); return NextResponse.json({alert:row},{status:201});}
  catch{return NextResponse.json({error:"Unable to create alert"},{status:400});}
}
export async function PATCH(req:NextRequest){
  const session=await getAdminSession(); if(!session||!["super_admin","district_admin"].includes(session.role)) return NextResponse.json({error:"Forbidden"},{status:403});
  try{const b=await req.json(); const id=String(b.id||""); const [before]=await db.select().from(quickAlerts).where(eq(quickAlerts.id,id)).limit(1); if(!before)return NextResponse.json({error:"Not found"},{status:404});
  const [row]=await db.update(quickAlerts).set({...b,id:undefined,startsAt:b.startsAt?new Date(b.startsAt):before.startsAt,endsAt:b.endsAt?new Date(b.endsAt):before.endsAt,updatedAt:new Date()}).where(eq(quickAlerts.id,id)).returning();
  await writeAudit(session,"quick_alert_update","quick_alert",id,row.titleEn,before,row); return NextResponse.json({alert:row});}catch{return NextResponse.json({error:"Unable to update alert"},{status:400});}
}