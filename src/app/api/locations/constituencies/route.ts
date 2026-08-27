import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { constituencies } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const districtId = searchParams.get("districtId");
    const tehsilId = searchParams.get("tehsilId");

    let query = db
      .select()
      .from(constituencies)
      .where(eq(constituencies.isActive, true))
      .$dynamic();

    if (districtId) {
      query = query.where(
        and(eq(constituencies.isActive, true), eq(constituencies.districtId, districtId))
      );
    }
    if (tehsilId) {
      query = query.where(
        and(eq(constituencies.isActive, true), eq(constituencies.tehsilId, tehsilId))
      );
    }

    const data = await query.orderBy(asc(constituencies.sortOrder), asc(constituencies.nameEn));

    return NextResponse.json({ constituencies: data });
  } catch (err) {
    console.error("Error fetching constituencies:", err);
    return NextResponse.json({ error: "Failed to fetch constituencies" }, { status: 500 });
  }
}
