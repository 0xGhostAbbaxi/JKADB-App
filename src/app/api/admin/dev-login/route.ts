import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signAdminToken } from "@/lib/auth";

/**
 * ⚠️ TEMPORARY DEV-ONLY ROUTE ⚠️
 * Logs in as the super_admin seeded via ADMIN_INITIAL_EMAIL, with NO password check.
 * Hard-blocked whenever NODE_ENV === "production", so it can never work even if this
 * code accidentally ships. Remove this file entirely before going live.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const targetEmail = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase();

  const [user] = targetEmail
    ? await db.select().from(adminUsers).where(eq(adminUsers.email, targetEmail)).limit(1)
    : await db.select().from(adminUsers).limit(1);

  if (!user) {
    return NextResponse.json({ error: "No admin user found to log in as. Run db:seed first." }, { status: 404 });
  }

  const token = await signAdminToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    departmentId: user.departmentId,
    districtId: user.districtId,
  });

  const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  response.headers.set("Cache-Control", "no-store");
  // Session cookie (no maxAge) — dies with the browser, same as the real login.
  response.cookies.set("jkadb_admin_token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
