import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedback, complaints, statusHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const feedbackSchema = z.object({
  trackingNumber: z.string(),
  verification: z.string().min(2),
  rating: z.enum(["resolved", "partially", "not_resolved"]),
  comment: z.string().optional(),
  requestReopen: z.boolean().optional(),
  reopenReason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { trackingNumber, verification, rating, comment, requestReopen, reopenReason } = parsed.data;

    const [complaint] = await db
      .select()
      .from(complaints)
      .where(and(eq(complaints.trackingNumber, trackingNumber), eq(complaints.isDraft, false)))
      .limit(1);

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    const fatherNameNormalized = complaint.fatherName.toLowerCase().trim();
    const verifNormalized = verification.toLowerCase().trim();
    const verificationPassed =
      fatherNameNormalized.includes(verifNormalized) ||
      verifNormalized.includes(fatherNameNormalized);

    if (!verificationPassed) {
      return NextResponse.json({ error: "Verification failed" }, { status: 403 });
    }

    await db.insert(feedback).values({
      complaintId: complaint.id,
      rating,
      comment: comment || null,
      requestReopen: requestReopen || false,
      reopenReason: reopenReason || null,
    });

    // If requesting reopen, update status
    if (requestReopen) {
      await db
        .update(complaints)
        .set({ status: "reopened", updatedAt: new Date() })
        .where(eq(complaints.id, complaint.id));

      await db.insert(statusHistory).values({
        complaintId: complaint.id,
        previousStatus: complaint.status,
        newStatus: "reopened",
        changedByName: complaint.fullName,
        reason: reopenReason || "Citizen requested reopen",
      });
    } else {
      // Close complaint
      await db
        .update(complaints)
        .set({ status: "closed", updatedAt: new Date() })
        .where(eq(complaints.id, complaint.id));

      await db.insert(statusHistory).values({
        complaintId: complaint.id,
        previousStatus: complaint.status,
        newStatus: "closed",
        changedByName: complaint.fullName,
        reason: "Complaint closed after citizen feedback",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
