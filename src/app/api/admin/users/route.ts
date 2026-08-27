import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers, departments, districts, auditLogs } from "@/db/schema";
import { getAdminSession, hasPermission } from "@/lib/auth";
import { eq, desc, ilike, or, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !hasPermission(session.role, ["district_admin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const search = searchParams.get("search");

    const conditions = [];
    if (search) {
      conditions.push(
        or(ilike(adminUsers.name, `%${search}%`), ilike(adminUsers.email, `%${search}%`))!
      );
    }

    const [countResult] = await db
      .select({ count: count() })
      .from(adminUsers);

    const users = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        designation: adminUsers.designation,
        isActive: adminUsers.isActive,
        lastLoginAt: adminUsers.lastLoginAt,
        createdAt: adminUsers.createdAt,
        departmentName: departments.nameEn,
        districtName: districts.nameEn,
      })
      .from(adminUsers)
      .leftJoin(departments, eq(adminUsers.departmentId, departments.id))
      .leftJoin(districts, eq(adminUsers.districtId, districts.id))
      .orderBy(desc(adminUsers.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      users,
      pagination: {
        total: Number(countResult?.count || 0),
        page,
        limit,
        pages: Math.ceil(Number(countResult?.count || 0) / limit),
      },
    });
  } catch (err) {
    console.error("Users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(100).regex(/^[a-zA-Z0-9._-]+$/),
  name: z.string().min(2).max(200),
  password: z.string().min(8),
  role: z.enum(["super_admin", "district_admin", "reviewer", "complaint_officer"]),
  departmentId: z.string().uuid().optional().nullable(),
  districtId: z.string().uuid().optional().nullable(),
  designation: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !hasPermission(session.role, ["district_admin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;

    // Only super_admin can create super_admin
    if (data.role === "super_admin" && session.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admin can create super admin accounts" }, { status: 403 });
    }

    const existing = await db
      .select()
      .from(adminUsers)
      .where(or(
        eq(adminUsers.email, data.email.toLowerCase()),
        eq(adminUsers.username, data.username.toLowerCase())
      ))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Email or username already exists" }, { status: 409 });
    }

    const hash = await bcrypt.hash(data.password, 12);

    const [user] = await db
      .insert(adminUsers)
      .values({
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        passwordHash: hash,
        name: data.name,
        role: data.role,
        departmentId: data.departmentId || null,
        districtId: data.districtId || null,
        designation: data.designation || null,
        phone: data.phone || null,
        mustChangePassword: true,
        isActive: true,
      })
      .returning({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
      });

    await db.insert(auditLogs).values({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      action: "create_user",
      targetType: "admin_user",
      targetId: user.id,
      targetDescription: `Created user: ${user.email}`,
      newValue: { email: user.email, role: user.role },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
