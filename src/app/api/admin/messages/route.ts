import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, complaints } from "@/db/schema";
import { getAdminSession, hasPermission } from "@/lib/auth";
import { desc, eq, ilike, or, count } from "drizzle-orm";
export async function GET(req: NextRequest) {
  const session = await getAdminSession(); if (!session || !hasPermission(session.role,["reviewer"])) return NextResponse.json({error:"Forbidden"},{status:403});
  const q = new URL(req.url).searchParams.get("search")?.trim() || "";
  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page") || 1)); const limit = Math.min(100, Math.max(10, Number(new URL(req.url).searchParams.get("limit") || 25))); const offset=(page-1)*limit;
  const where = q ? or(ilike(messages.content, `%${q}%`), ilike(messages.senderName, `%${q}%`), ilike(complaints.trackingNumber, `%${q}%`)) : undefined;
  const [total] = await db.select({count:count()}).from(messages).leftJoin(complaints,eq(messages.complaintId,complaints.id)).where(where);
  const rows = await db.select({id:messages.id, content:messages.content, messageType:messages.messageType, senderName:messages.senderName, isRead:messages.isRead, createdAt:messages.createdAt, complaintId:messages.complaintId, trackingNumber:complaints.trackingNumber, citizenName:complaints.fullName}).from(messages).leftJoin(complaints,eq(messages.complaintId,complaints.id)).where(where).orderBy(desc(messages.createdAt)).limit(limit).offset(offset);
  return NextResponse.json({messages:rows,pagination:{total:Number(total?.count||0),page,limit,pages:Math.ceil(Number(total?.count||0)/limit)}});
}
