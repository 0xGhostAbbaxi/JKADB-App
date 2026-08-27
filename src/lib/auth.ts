import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { rolePermissions, permissions } from "@/db/schema";

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "development-only-change-me");
if (!JWT_SECRET) throw new Error("JWT_SECRET must be configured in production.");
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string | null;
  districtId?: string | null;
}

export async function signAdminToken(session: AdminSession): Promise<string> {
  return new SignJWT(session as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey) as Promise<string>;
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jkadb_admin_token")?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getAdminUser(id: string) {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  return user || null;
}

export function hasPermission(role: string, requiredRoles: string[]): boolean {
  const roleHierarchy: Record<string, number> = {
    super_admin: 100,
    district_admin: 80,
    reviewer: 60,
    complaint_officer: 40,
    citizen: 10,
  };
  const userLevel = roleHierarchy[role] ?? 0;
  return requiredRoles.some((r) => userLevel >= (roleHierarchy[r] ?? 0));
}

export function canManageComplaints(role: string): boolean {
  return hasPermission(role, ["complaint_officer"]);
}

export function canManageUsers(role: string): boolean {
  return hasPermission(role, ["district_admin"]);
}

export function canViewSensitiveData(role: string): boolean {
  return hasPermission(role, ["reviewer"]);
}

export function isSuperAdmin(role: string): boolean {
  return role === "super_admin";
}

export async function hasExplicitPermission(role: string, permissionKey: string): Promise<boolean> {
  if (role === "super_admin") return true;
  const rows = await db
    .select({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(rolePermissions.role, role as any), eq(permissions.key, permissionKey)))
    .limit(1);
  return rows.length > 0;
}

export async function requirePermission(permissionKey: string): Promise<AdminSession> {
  const session = await requireAdminSession();
  if (await hasExplicitPermission(session.role, permissionKey)) return session;
  throw new Error("Forbidden");
}
