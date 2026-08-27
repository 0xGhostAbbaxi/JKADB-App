import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { departments, auditLogs } from "@/db/schema";
import { getAdminSession, hasPermission } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await db
      .select()
      .from(departments)
      .orderBy(asc(departments.nameEn));

    return NextResponse.json({ departments: data });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

const deptSchema = z.object({
  nameEn: z.string().min(2),
  nameUr: z.string().optional(),
  description: z.string().optional(),
  slaHours: z.number().optional(),
  responsibleArea: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !hasPermission(session.role, ["district_admin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = deptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const [dept] = await db.insert(departments).values(parsed.data).returning();

    await db.insert(auditLogs).values({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      action: "create_department",
      targetType: "department",
      targetId: dept.id,
      targetDescription: `Created department: ${dept.nameEn}`,
    });

    return NextResponse.json({ department: dept });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
