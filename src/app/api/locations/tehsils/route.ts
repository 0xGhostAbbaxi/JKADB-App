import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tehsils } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const districtId = searchParams.get("districtId");

    if (!districtId) {
      return NextResponse.json({ error: "districtId is required" }, { status: 400 });
    }

    const data = await db
      .select()
      .from(tehsils)
      .where(and(eq(tehsils.districtId, districtId), eq(tehsils.isActive, true)))
      .orderBy(asc(tehsils.sortOrder), asc(tehsils.nameEn));

    return NextResponse.json({ tehsils: data });
  } catch (err) {
    console.error("Error fetching tehsils:", err);
    return NextResponse.json({ error: "Failed to fetch tehsils" }, { status: 500 });
  }
}
