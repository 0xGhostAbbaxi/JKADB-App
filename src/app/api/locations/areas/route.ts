import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { areas } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const districtId = searchParams.get("districtId");
    const tehsilId = searchParams.get("tehsilId");

    let whereClause = eq(areas.isActive, true);

    if (districtId) {
      whereClause = and(eq(areas.isActive, true), eq(areas.districtId, districtId))!;
    } else if (tehsilId) {
      whereClause = and(eq(areas.isActive, true), eq(areas.tehsilId, tehsilId))!;
    }

    const data = await db
      .select()
      .from(areas)
      .where(whereClause)
      .orderBy(asc(areas.sortOrder), asc(areas.nameEn));

    return NextResponse.json({ areas: data });
  } catch (err) {
    console.error("Error fetching areas:", err);
    return NextResponse.json({ error: "Failed to fetch areas" }, { status: 500 });
  }
}
