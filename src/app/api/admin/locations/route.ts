import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { districts, tehsils, unionCouncils, constituencies, areas, auditLogs } from "@/db/schema";
import { getAdminSession, hasPermission } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "districts";

    if (type === "districts") {
      const data = await db.select().from(districts).orderBy(asc(districts.sortOrder), asc(districts.nameEn));
      return NextResponse.json({ data });
    }

    if (type === "tehsils") {
      const districtId = searchParams.get("districtId");
      let query = db.select().from(tehsils).$dynamic();
      if (districtId) query = query.where(eq(tehsils.districtId, districtId));
      const data = await query.orderBy(asc(tehsils.nameEn));
      return NextResponse.json({ data });
    }

    if (type === "union-councils") {
      const tehsilId = searchParams.get("tehsilId");
      let query = db.select().from(unionCouncils).$dynamic();
      if (tehsilId) query = query.where(eq(unionCouncils.tehsilId, tehsilId));
      const data = await query.orderBy(asc(unionCouncils.nameEn));
      return NextResponse.json({ data });
    }

    if (type === "constituencies") {
      const data = await db.select().from(constituencies).orderBy(asc(constituencies.sortOrder), asc(constituencies.nameEn));
      return NextResponse.json({ data });
    }

    if (type === "areas") {
      const data = await db.select().from(areas).orderBy(asc(areas.nameEn));
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Locations admin error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

const districtSchema = z.object({
  type: z.enum(["district", "tehsil", "union_council", "constituency", "area"]),
  nameEn: z.string().min(1),
  nameUr: z.string().optional(),
  code: z.string().optional(),
  districtId: z.string().uuid().optional().nullable(),
  tehsilId: z.string().uuid().optional().nullable(),
  unionCouncilId: z.string().uuid().optional().nullable(),
  constituencyType: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !hasPermission(session.role, ["district_admin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = districtSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { type, nameEn, nameUr, code, districtId, tehsilId, unionCouncilId, constituencyType } = parsed.data;
    let inserted: unknown;

    if (type === "district") {
      const [d] = await db.insert(districts).values({ nameEn, nameUr, code }).returning();
      inserted = d;
    } else if (type === "tehsil" && districtId) {
      const [t] = await db.insert(tehsils).values({ nameEn, nameUr, code, districtId }).returning();
      inserted = t;
    } else if (type === "union_council" && tehsilId && districtId) {
      const [uc] = await db.insert(unionCouncils).values({ nameEn, nameUr, tehsilId, districtId }).returning();
      inserted = uc;
    } else if (type === "constituency") {
      const [c] = await db.insert(constituencies).values({ nameEn, nameUr, code, districtId, tehsilId, constituencyType: constituencyType || "LA" }).returning();
      inserted = c;
    } else if (type === "area") {
      const [a] = await db.insert(areas).values({ nameEn, nameUr, districtId, tehsilId, unionCouncilId }).returning();
      inserted = a;
    } else {
      return NextResponse.json({ error: "Invalid type or missing required fields" }, { status: 400 });
    }

    await db.insert(auditLogs).values({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      action: `create_location_${type}`,
      targetType: type,
      targetDescription: `Created ${type}: ${nameEn}`,
      newValue: { nameEn, nameUr, code },
    });

    return NextResponse.json({ data: inserted });
  } catch (err) {
    console.error("Create location error:", err);
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
  }
}
