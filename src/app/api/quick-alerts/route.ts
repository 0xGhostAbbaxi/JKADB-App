import { NextResponse } from "next/server";
import { db } from "@/db";
import { quickAlerts } from "@/db/schema";
import { and, eq, lte, gte, or, isNull } from "drizzle-orm";
export async function GET(){
 const now=new Date();
 const rows=await db.select().from(quickAlerts).where(and(eq(quickAlerts.isActive,true),or(isNull(quickAlerts.startsAt),lte(quickAlerts.startsAt,now)),or(isNull(quickAlerts.endsAt),gte(quickAlerts.endsAt,now))));
 return NextResponse.json({alerts:rows});
}