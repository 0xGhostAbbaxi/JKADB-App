import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { postOffices } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tehsilId = searchParams.get("tehsilId");
  const unionCouncilId = searchParams.get("unionCouncilId");
  if (!tehsilId && !unionCouncilId) return NextResponse.json({ postOffices: [] });
  const conditions = [];
  if (tehsilId) conditions.push(eq(postOffices.tehsilId, tehsilId));
  if (unionCouncilId) conditions.push(eq(postOffices.unionCouncilId, unionCouncilId));
  conditions.push(eq(postOffices.isActive, true));
  const rows = await db.select().from(postOffices).where(and(...conditions));
  return NextResponse.json({ postOffices: rows });
}
