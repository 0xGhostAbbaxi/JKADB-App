import { NextResponse } from "next/server";
import { db } from "@/db";
import { advertisements } from "@/db/schema";
import { and, eq, or, isNull, lte, gte, desc } from "drizzle-orm";

export async function GET() {
  const now = new Date();
  const [row] = await db
    .select()
    .from(advertisements)
    .where(
      and(
        eq(advertisements.isActive, true),
        or(isNull(advertisements.startsAt), lte(advertisements.startsAt, now)),
        or(isNull(advertisements.endsAt), gte(advertisements.endsAt, now))
      )
    )
    .orderBy(desc(advertisements.createdAt))
    .limit(1);

  const response = NextResponse.json({ advertisement: row || null });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
