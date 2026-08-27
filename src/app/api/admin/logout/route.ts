import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function POST() {
  const session = await getAdminSession();

  if (session) {
    await db.insert(auditLogs).values({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      action: "admin_logout",
      targetType: "admin_user",
      targetId: session.id,
      targetDescription: `Admin logout: ${session.email}`,
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("jkadb_admin_token");
  return response;
}
