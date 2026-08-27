import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { adminUsers, auditLogs } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [user] = await db.select({ id: adminUsers.id, email: adminUsers.email, username: adminUsers.username, name: adminUsers.name, role: adminUsers.role, designation: adminUsers.designation, phone: adminUsers.phone, lastLoginAt: adminUsers.lastLoginAt }).from(adminUsers).where(eq(adminUsers.id, session.id)).limit(1);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    const [before] = await db.select().from(adminUsers).where(eq(adminUsers.id, session.id)).limit(1);
    if (!before) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const update: Record<string, unknown> = {};
    if (typeof b.name === "string" && b.name.trim()) update.name = b.name.trim();
    if (typeof b.designation === "string") update.designation = b.designation.trim() || null;
    if (typeof b.phone === "string") update.phone = b.phone.trim() || null;
    if (b.currentPassword || b.newPassword) {
      if (!b.currentPassword || !b.newPassword || String(b.newPassword).length < 8) return NextResponse.json({ error: "Current password and a new password of at least 8 characters are required" }, { status: 400 });
      if (!(await bcrypt.compare(String(b.currentPassword), before.passwordHash))) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      update.passwordHash = await bcrypt.hash(String(b.newPassword), 12); update.mustChangePassword = false;
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    const [user] = await db.update(adminUsers).set(update).where(eq(adminUsers.id, session.id)).returning({ id: adminUsers.id, email: adminUsers.email, username: adminUsers.username, name: adminUsers.name, role: adminUsers.role, designation: adminUsers.designation, phone: adminUsers.phone });
    await db.insert(auditLogs).values({ actorId: session.id, actorName: session.name, actorRole: session.role, action: "admin_profile_update", targetType: "admin_user", targetId: session.id, targetDescription: `Updated own profile`, newValue: { fields: Object.keys(update).filter(k => k !== "passwordHash") } });
    return NextResponse.json({ user });
  } catch { return NextResponse.json({ error: "Unable to update profile" }, { status: 400 }); }
}
