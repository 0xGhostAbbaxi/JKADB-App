import { NextResponse } from "next/server";
import { db } from "@/db";
import { districts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(districts)
      .where(eq(districts.isActive, true))
      .orderBy(asc(districts.sortOrder), asc(districts.nameEn));

    return NextResponse.json({ districts: data });
  } catch (err) {
    console.error("Error fetching districts:", err);
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500 });
  }
}
