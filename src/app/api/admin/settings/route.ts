import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings, auditLogs } from "@/db/schema";
import { getAdminSession, hasPermission } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const session = await getAdminSession();
  if (!session || !hasPermission(session.role, ["district_admin"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rows = await db.select().from(systemSettings).orderBy(asc(systemSettings.key));
  return NextResponse.json({ settings: rows.map(r => ({ ...r, value: r.value ?? "" })) });
}
export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const settings = Array.isArray(body.settings) ? body.settings : [];
    for (const item of settings) {
      const key = String(item.key || "").trim(); if (!key || key.length > 200) continue;
      const value = String(item.value ?? "");
      const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
      if (existing) await db.update(systemSettings).set({ value, updatedBy: session.id, updatedAt: new Date() }).where(eq(systemSettings.key, key));
      else await db.insert(systemSettings).values({ key, value, updatedBy: session.id });
      await db.insert(auditLogs).values({ actorId: session.id, actorName: session.name, actorRole: session.role, action: "settings_change", targetType: "system_setting", targetId: key, targetDescription: `Updated setting: ${key}`, newValue: { value } });
    }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Unable to save settings" }, { status: 400 }); }
}
