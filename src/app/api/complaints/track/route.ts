import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  complaints,
  districts,
  tehsils,
  categories,
  departments,
  adminUsers,
  statusHistory,
  messages,
  feedback,
} from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  const limitResult = rateLimit(`track_${ip}`, 20, 60 * 60 * 1000);
  if (!limitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { trackingNumber, verification } = body;

    if (!trackingNumber || !verification) {
      return NextResponse.json(
        { error: "Tracking number and verification are required" },
        { status: 400 }
      );
    }

    const [complaint] = await db
      .select()
      .from(complaints)
      .where(
        and(
          eq(complaints.trackingNumber, trackingNumber.trim().toUpperCase()),
          eq(complaints.isDraft, false),
          ne(complaints.status, "withdrawn")
        )
      )
      .limit(1);

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    // Verify identity using an exact normalized father-name match.
    // Do not reveal whether the reference itself exists until verification succeeds.
    const normalize = (value: string) => value.toLowerCase().replace(/\\s+/g, " ").trim();
    const verificationPassed = normalize(complaint.fatherName) === normalize(String(verification));

    if (!verificationPassed) {
      return NextResponse.json(
        { error: "Verification failed. Please check your verification details." },
        { status: 403 }
      );
    }

    // Fetch related data
    let districtName = null;
    let tehsilName = null;
    let categoryName = null;
    let departmentName = null;
    let officerName = null;

    if (complaint.districtId) {
      const [d] = await db.select().from(districts).where(eq(districts.id, complaint.districtId)).limit(1);
      districtName = d?.nameEn;
    }
    if (complaint.tehsilId) {
      const [t] = await db.select().from(tehsils).where(eq(tehsils.id, complaint.tehsilId)).limit(1);
      tehsilName = t?.nameEn;
    }
    if (complaint.categoryId) {
      const [c] = await db.select().from(categories).where(eq(categories.id, complaint.categoryId)).limit(1);
      categoryName = c?.nameEn;
    }
    if (complaint.departmentId) {
      const [d] = await db.select().from(departments).where(eq(departments.id, complaint.departmentId)).limit(1);
      departmentName = d?.nameEn;
    }
    if (complaint.assignedOfficerId) {
      const [o] = await db.select().from(adminUsers).where(eq(adminUsers.id, complaint.assignedOfficerId)).limit(1);
      officerName = o?.name;
    }

    // Get status history
    const history = await db
      .select()
      .from(statusHistory)
      .where(eq(statusHistory.complaintId, complaint.id))
      .orderBy(statusHistory.createdAt);

    // Get public messages (not internal notes)
    const publicMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.complaintId, complaint.id),
          ne(messages.messageType, "internal_note")
        )
      )
      .orderBy(messages.createdAt);

    // Get feedback
    const [fb] = await db
      .select()
      .from(feedback)
      .where(eq(feedback.complaintId, complaint.id))
      .limit(1);

    return NextResponse.json({
      complaint: {
        id: complaint.id,
        trackingNumber: complaint.trackingNumber,
        fullName: complaint.fullName,
        fatherName: complaint.fatherName,
        cnicMasked: complaint.cnicMasked,
        districtName,
        tehsilName,
        tehsilCustom: complaint.tehsilCustom,
        categoryName,
        description: complaint.description,
        additionalInfo: complaint.additionalInfo,
        status: complaint.status,
        priority: complaint.priority,
        departmentName,
        officerName,
        slaDeadline: complaint.slaDeadline,
        slaStatus: complaint.slaStatus,
        resolvedAt: complaint.resolvedAt,
        resolutionDescription: complaint.resolutionDescription,
        officialResponse: complaint.officialResponse,
        submittedAt: complaint.submittedAt,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
      },
      statusHistory: history.map((h) => ({
        id: h.id,
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        changedByName: h.changedByName,
        reason: h.reason,
        createdAt: h.createdAt,
      })),
      messages: publicMessages.map((m) => ({
        id: m.id,
        messageType: m.messageType,
        content: m.content,
        senderName: m.senderName || (m.senderAdminId ? "Officer" : "Citizen"),
        createdAt: m.createdAt,
      })),
      feedback: fb || null,
    });
  } catch (err) {
    console.error("Track error:", err);
    return NextResponse.json({ error: "Failed to track complaint" }, { status: 500 });
  }
}
