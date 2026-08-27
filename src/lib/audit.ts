import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import type { AdminSession } from "@/lib/auth";

export async function writeAudit(
  session: AdminSession,
  action: string,
  targetType: string,
  targetId?: string,
  targetDescription?: string,
  previousValue?: unknown,
  newValue?: unknown,
  metadata?: unknown,
  ipAddress?: string | null,
) {
  await db.insert(auditLogs).values({
    actorId: session.id,
    actorName: session.name,
    actorRole: session.role,
    action,
    targetType,
    targetId,
    targetDescription,
    previousValue: previousValue as any,
    newValue: newValue as any,
    metadata: metadata as any,
    ipAddress: ipAddress || undefined,
  });
}
