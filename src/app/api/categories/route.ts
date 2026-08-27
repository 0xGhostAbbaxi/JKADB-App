import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, subcategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { auditLogs } from "@/db/schema";

export async function GET() {
  try {
    const cats = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.nameEn));

    const subs = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.isActive, true))
      .orderBy(asc(subcategories.sortOrder));

    const result = cats.map((cat) => ({
      ...cat,
      subcategories: subs.filter((s) => s.categoryId === cat.id),
    }));

    return NextResponse.json({ categories: result });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !["super_admin", "district_admin"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nameEn, nameUr, description, icon } = body;

    if (!nameEn) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [cat] = await db
      .insert(categories)
      .values({ nameEn, nameUr, description, icon })
      .returning();

    await db.insert(auditLogs).values({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      action: "create_category",
      targetType: "category",
      targetId: cat.id,
      targetDescription: `Created category: ${nameEn}`,
      newValue: { nameEn, nameUr },
    });

    return NextResponse.json({ category: cat });
  } catch (err) {
    console.error("Error creating category:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
