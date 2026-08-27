import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  complaints,
  districts,
  tehsils,
  unionCouncils,
  constituencies,
  areas,
  categories,
  subcategories,
  departments,
  adminUsers,
  statusHistory,
  messages,
  attachments,
  feedback,
  auditLogs,
  escalations,
} from "@/db/schema";
import { getAdminSession, hasPermission } from "@/lib/auth";
import { eq, and, ne, asc } from "drizzle-orm";
import { z } from "zod";
import { getSlaDeadline } from "@/lib/utils";
import type { InferSelectModel } from "drizzle-orm";

type ComplaintStatus = InferSelectModel<typeof complaints>["status"];
type ComplaintPriority = InferSelectModel<typeof complaints>["priority"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, id))
      .limit(1);

    if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Mark as read
    if (!complaint.isRead) {
      await db
        .update(complaints)
        .set({ isRead: true, readAt: new Date(), readBy: session.id })
        .where(eq(complaints.id, id));
    }

    // Fetch related
    const [district] = complaint.districtId
      ? await db.select().from(districts).where(eq(districts.id, complaint.districtId)).limit(1)
      : [null];
    const [tehsil] = complaint.tehsilId
      ? await db.select().from(tehsils).where(eq(tehsils.id, complaint.tehsilId)).limit(1)
      : [null];
    const [uc] = complaint.unionCouncilId
      ? await db.select().from(unionCouncils).where(eq(unionCouncils.id, complaint.unionCouncilId)).limit(1)
      : [null];
    const [constituency] = complaint.constituencyId
      ? await db.select().from(constituencies).where(eq(constituencies.id, complaint.constituencyId)).limit(1)
      : [null];
    const [area] = complaint.areaId
      ? await db.select().from(areas).where(eq(areas.id, complaint.areaId)).limit(1)
      : [null];
    const [category] = complaint.categoryId
      ? await db.select().from(categories).where(eq(categories.id, complaint.categoryId)).limit(1)
      : [null];
    const [subcategory] = complaint.subcategoryId
      ? await db.select().from(subcategories).where(eq(subcategories.id, complaint.subcategoryId)).limit(1)
      : [null];
    const [department] = complaint.departmentId
      ? await db.select().from(departments).where(eq(departments.id, complaint.departmentId)).limit(1)
      : [null];
    const [officer] = complaint.assignedOfficerId
      ? await db.select().from(adminUsers).where(eq(adminUsers.id, complaint.assignedOfficerId)).limit(1)
      : [null];

    const history = await db
      .select()
      .from(statusHistory)
      .where(eq(statusHistory.complaintId, id))
      .orderBy(asc(statusHistory.createdAt));

    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.complaintId, id))
      .orderBy(asc(messages.createdAt));

    const publicMessages = allMessages.filter((m) => m.messageType !== "internal_note");
    const internalNotes = allMessages.filter((m) => m.messageType === "internal_note");

    const files = await db
      .select()
      .from(attachments)
      .where(eq(attachments.complaintId, id));

    const [fb] = await db
      .select()
      .from(feedback)
      .where(eq(feedback.complaintId, id))
      .limit(1);

    const escList = await db
      .select()
      .from(escalations)
      .where(eq(escalations.complaintId, id));

    // Show CNIC only to authorized roles
    const canSeeCnic = hasPermission(session.role, ["reviewer"]);

    return NextResponse.json({
      complaint: {
        ...complaint,
        cnicHash: undefined, // Never expose hash
        cnicNumber: canSeeCnic ? complaint.cnicMasked : complaint.cnicMasked,
        district: district ? { id: district.id, nameEn: district.nameEn, nameUr: district.nameUr } : null,
        tehsil: tehsil ? { id: tehsil.id, nameEn: tehsil.nameEn, nameUr: tehsil.nameUr } : null,
        unionCouncil: uc ? { id: uc.id, nameEn: uc.nameEn } : null,
        constituency: constituency ? { id: constituency.id, nameEn: constituency.nameEn, code: constituency.code } : null,
        area: area ? { id: area.id, nameEn: area.nameEn } : null,
        category: category ? { id: category.id, nameEn: category.nameEn, nameUr: category.nameUr } : null,
        subcategory: subcategory ? { id: subcategory.id, nameEn: subcategory.nameEn } : null,
        department: department ? { id: department.id, nameEn: department.nameEn } : null,
        officer: officer ? { id: officer.id, name: officer.name, designation: officer.designation } : null,
      },
      statusHistory: history,
      messages: publicMessages,
      internalNotes: hasPermission(session.role, ["complaint_officer"]) ? internalNotes : [],
      attachments: files,
      feedback: fb || null,
      escalations: escList,
    });
  } catch (err) {
    console.error("Complaint detail error:", err);
    return NextResponse.json({ error: "Failed to fetch complaint" }, { status: 500 });
  }
}

const updateSchema = z.object({
  action: z.enum([
    "status",
    "priority",
    "assign",
    "reply",
    "internal_note",
    "resolve",
    "reject",
    "escalate",
    "mark_duplicate",
  ]),
  status: z.string().optional(),
  priority: z.string().optional(),
  officerId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  message: z.string().optional(),
  reason: z.string().optional(),
  resolutionDescription: z.string().optional(),
  officialResponse: z.string().optional(),
  duplicateOfId: z.string().uuid().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasPermission(session.role, ["complaint_officer"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data = parsed.data;

    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, id))
      .limit(1);

    if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const now = new Date();

    if (data.action === "status" && data.status) {
      const previousStatus = complaint.status;
      const newStatus = data.status as ComplaintStatus;

      await db
        .update(complaints)
        .set({ status: newStatus, updatedAt: now })
        .where(eq(complaints.id, id));

      await db.insert(statusHistory).values({
        complaintId: id,
        previousStatus,
        newStatus,
        changedBy: session.id,
        changedByName: session.name,
        reason: data.reason || null,
      });

      await db.insert(auditLogs).values({
        actorId: session.id,
        actorName: session.name,
        actorRole: session.role,
        action: "change_status",
        targetType: "complaint",
        targetId: id,
        targetDescription: `${complaint.trackingNumber}: ${previousStatus} → ${newStatus}`,
        previousValue: { status: previousStatus },
        newValue: { status: newStatus },
      });
    }

    if (data.action === "priority" && data.priority) {
      const previousPriority = complaint.priority;
      const newPriority = data.priority as ComplaintPriority;

      await db
        .update(complaints)
        .set({ priority: newPriority, updatedAt: now })
        .where(eq(complaints.id, id));

      await db.insert(auditLogs).values({
        actorId: session.id,
        actorName: session.name,
        actorRole: session.role,
        action: "change_priority",
        targetType: "complaint",
        targetId: id,
        targetDescription: `${complaint.trackingNumber}: priority ${previousPriority} → ${newPriority}`,
        previousValue: { priority: previousPriority },
        newValue: { priority: newPriority },
      });
    }

    if (data.action === "assign") {
      await db
        .update(complaints)
        .set({
          assignedOfficerId: data.officerId || null,
          departmentId: data.departmentId || complaint.departmentId,
          status: data.officerId ? "assigned" : complaint.status,
          assignedAt: data.officerId ? now : null,
          updatedAt: now,
        })
        .where(eq(complaints.id, id));

      if (data.officerId && complaint.status === "submitted") {
        await db.insert(statusHistory).values({
          complaintId: id,
          previousStatus: complaint.status,
          newStatus: "assigned",
          changedBy: session.id,
          changedByName: session.name,
          reason: `Assigned to officer`,
        });
      }

      await db.insert(auditLogs).values({
        actorId: session.id,
        actorName: session.name,
        actorRole: session.role,
        action: "assign_complaint",
        targetType: "complaint",
        targetId: id,
        targetDescription: `${complaint.trackingNumber} assigned`,
        newValue: { officerId: data.officerId, departmentId: data.departmentId },
      });
    }

    if (data.action === "reply" && data.message) {
      await db.insert(messages).values({
        complaintId: id,
        messageType: "officer",
        content: data.message.trim(),
        senderName: session.name,
        senderAdminId: session.id,
      });

      // Update status to awaiting_citizen_response if currently in certain statuses
      const statusesToUpdate = ["submitted", "under_review", "assigned"];
      if (statusesToUpdate.includes(complaint.status)) {
        await db
          .update(complaints)
          .set({ status: "awaiting_citizen_response", updatedAt: now })
          .where(eq(complaints.id, id));

        await db.insert(statusHistory).values({
          complaintId: id,
          previousStatus: complaint.status,
          newStatus: "awaiting_citizen_response",
          changedBy: session.id,
          changedByName: session.name,
          reason: "Officer replied",
        });
      }
    }

    if (data.action === "internal_note" && data.message) {
      await db.insert(messages).values({
        complaintId: id,
        messageType: "internal_note",
        content: data.message.trim(),
        senderName: session.name,
        senderAdminId: session.id,
      });
    }

    if (data.action === "resolve") {
      await db
        .update(complaints)
        .set({
          status: "resolved",
          resolvedAt: now,
          resolvedBy: session.id,
          resolutionDescription: data.resolutionDescription || null,
          officialResponse: data.officialResponse || null,
          updatedAt: now,
        })
        .where(eq(complaints.id, id));

      await db.insert(statusHistory).values({
        complaintId: id,
        previousStatus: complaint.status,
        newStatus: "resolved",
        changedBy: session.id,
        changedByName: session.name,
        reason: data.reason || "Resolved by officer",
      });

      if (data.officialResponse) {
        await db.insert(messages).values({
          complaintId: id,
          messageType: "officer",
          content: `Official Resolution: ${data.officialResponse}`,
          senderName: session.name,
          senderAdminId: session.id,
        });
      }

      await db.insert(auditLogs).values({
        actorId: session.id,
        actorName: session.name,
        actorRole: session.role,
        action: "resolve_complaint",
        targetType: "complaint",
        targetId: id,
        targetDescription: `${complaint.trackingNumber} resolved`,
      });
    }

    if (data.action === "reject") {
      await db
        .update(complaints)
        .set({ status: "rejected", updatedAt: now })
        .where(eq(complaints.id, id));

      await db.insert(statusHistory).values({
        complaintId: id,
        previousStatus: complaint.status,
        newStatus: "rejected",
        changedBy: session.id,
        changedByName: session.name,
        reason: data.reason || "Rejected by officer",
      });
    }

    if (data.action === "escalate") {
      await db
        .update(complaints)
        .set({ status: "escalated", updatedAt: now })
        .where(eq(complaints.id, id));

      await db.insert(escalations).values({
        complaintId: id,
        escalatedBy: session.id,
        reason: data.reason || null,
        level: 1,
      });

      await db.insert(statusHistory).values({
        complaintId: id,
        previousStatus: complaint.status,
        newStatus: "escalated",
        changedBy: session.id,
        changedByName: session.name,
        reason: data.reason || "Escalated",
      });
    }

    if (data.action === "mark_duplicate" && data.duplicateOfId) {
      await db
        .update(complaints)
        .set({ status: "duplicate", duplicateOfId: data.duplicateOfId, updatedAt: now })
        .where(eq(complaints.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Complaint update error:", err);
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });
  }
}
