import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { advertisements } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { eq } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !["super_admin", "district_admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const [before] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;
    if (typeof body.title === "string") update.title = body.title.trim();
    if ("linkUrl" in body) update.linkUrl = body.linkUrl ? String(body.linkUrl).trim() : null;
    if ("ctaLabel" in body) update.ctaLabel = body.ctaLabel ? String(body.ctaLabel).trim() : null;
    if ("startsAt" in body) update.startsAt = body.startsAt ? new Date(body.startsAt) : null;
    if ("endsAt" in body) update.endsAt = body.endsAt ? new Date(body.endsAt) : null;

    const [row] = await db.update(advertisements).set(update).where(eq(advertisements.id, id)).returning();
    await writeAudit(session, "advertisement_update", "advertisement", id, row.title, before, row);
    return NextResponse.json({ advertisement: row });
  } catch (err) {
    console.error("[advertisements] update failed", err);
    return NextResponse.json({ error: "Unable to update advertisement." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !["super_admin", "district_admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const [before] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(advertisements).where(eq(advertisements.id, id));

  const filePath = path.join(process.cwd(), "public", before.imageUrl);
  await fs.unlink(filePath).catch(() => {});

  await writeAudit(session, "advertisement_delete", "advertisement", id, before.title);
  return NextResponse.json({ success: true });
}
