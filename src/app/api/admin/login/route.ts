import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { adminUsers, auditLogs } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { signAdminToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Rate limit: 5 attempts per 15 minutes per IP
  const limit = rateLimit(`admin_login_${ip}`, 5, 15 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { identifier, email, password } = body;
    const loginIdentifier = String(identifier || email || "").trim();

    if (!loginIdentifier || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(or(
        eq(adminUsers.email, loginIdentifier.toLowerCase()),
        eq(adminUsers.username, loginIdentifier.toLowerCase())
      ))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is disabled. Contact administrator." }, { status: 403 });
    }

    // Check if locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return NextResponse.json(
        { error: "Account temporarily locked. Try again later." },
        { status: 423 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      // Increment failed attempts
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: Record<string, unknown> = { failedLoginAttempts: newAttempts };

      if (newAttempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30);
        updateData.lockedUntil = lockUntil;
      }

      await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, user.id));
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Reset failed attempts
    await db
      .update(adminUsers)
      .set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
      .where(eq(adminUsers.id, user.id));

    const token = await signAdminToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      districtId: user.districtId,
    });

    // Audit log
    await db.insert(auditLogs).values({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "admin_login",
      targetType: "admin_user",
      targetId: user.id,
      targetDescription: `Admin login: ${user.email}`,
      ipAddress: ip,
      metadata: { email: user.email },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });

    response.headers.set("Cache-Control", "no-store");
    // Session cookie: no maxAge/expires set, so the browser discards it when
    // the browser itself is closed — the admin must log in again next time,
    // even though the JWT payload remains valid for 8h in case the tab stays open.
    response.cookies.set("jkadb_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
