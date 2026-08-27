import { NextResponse } from "next/server";
import { db } from "@/db";
import { faqItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(faqItems)
      .where(eq(faqItems.isActive, true))
      .orderBy(asc(faqItems.sortOrder));

    return NextResponse.json({ faq: items });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch FAQ" }, { status: 500 });
  }
}
