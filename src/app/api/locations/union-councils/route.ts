import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { unionCouncils } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tehsilId = searchParams.get("tehsilId");

    if (!tehsilId) {
      return NextResponse.json({ error: "tehsilId is required" }, { status: 400 });
    }

    const data = await db
      .select()
      .from(unionCouncils)
      .where(and(eq(unionCouncils.tehsilId, tehsilId), eq(unionCouncils.isActive, true)))
      .orderBy(asc(unionCouncils.sortOrder), asc(unionCouncils.nameEn));

    return NextResponse.json({ unionCouncils: data });
  } catch (err) {
    console.error("Error fetching union councils:", err);
    return NextResponse.json({ error: "Failed to fetch union councils" }, { status: 500 });
  }
}
