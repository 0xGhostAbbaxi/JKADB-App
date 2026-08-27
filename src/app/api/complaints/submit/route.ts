import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  complaints,
  statusHistory,
  notifications,
  slaConfigurations,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashCnic, maskCnic, validateCnic, generateTrackingSecret, getSlaDeadline } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const submitSchema = z.object({
  fullName: z.string().min(2).max(200),
  fatherName: z.string().min(2).max(200),
  cnicNumber: z.string().refine((v) => validateCnic(v), "Invalid CNIC"),
  phone: z.string().min(7).max(30),
  email: z.string().email().optional().or(z.literal("")),
  districtId: z.string().uuid().optional().nullable(),
  tehsilId: z.string().uuid().optional().nullable(),
  tehsilCustom: z.string().optional().nullable(),
  unionCouncilId: z.string().uuid().optional().nullable(),
  unionCouncilCustom: z.string().optional().nullable(),
  postOfficeId: z.string().uuid().optional().nullable(),
  postOfficeCustom: z.string().optional().nullable(),
  constituencyId: z.string().uuid().optional().nullable(),
  areaId: z.string().uuid().optional().nullable(),
  areaCustom: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  subcategoryId: z.string().uuid().optional().nullable(),
  description: z.string().min(10).max(5000),
  additionalInfo: z.string().optional().nullable(),
  language: z.enum(["en", "ur"]).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Rate limit: 5 submissions per hour per IP
  const limitResult = rateLimit(`complaint_submit_${ip}`, 5, 60 * 60 * 1000);
  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait before submitting again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const idempotencyKey = req.headers.get("idempotency-key")?.trim() || null;
    if (idempotencyKey) {
      const existing = await db.select({
        trackingNumber: complaints.trackingNumber,
        complaintId: complaints.id,
        trackingSecret: complaints.trackingSecret,
        submittedAt: complaints.submittedAt,
      }).from(complaints).where(eq(complaints.idempotencyKey, idempotencyKey)).limit(1);
      if (existing.length) return NextResponse.json({ success: true, ...existing[0], replayed: true });
    }

    // Hash CNIC for secure storage
    const cnicHash = hashCnic(data.cnicNumber);
    const cnicMasked = maskCnic(data.cnicNumber);

    // Generate tracking secret
    const trackingSecret = generateTrackingSecret();

    // Get SLA for priority normal
    const [slaConfig] = await db
      .select()
      .from(slaConfigurations)
      .where(eq(slaConfigurations.priority, "normal"))
      .limit(1);

    const slaHours = slaConfig?.hoursToResolve || 72;
    const now = new Date();
    const slaDeadline = getSlaDeadline(now, slaHours);

    // Insert complaint (sequence number auto-increments)
    const [complaint] = await db
      .insert(complaints)
      .values({
        trackingNumber: "TEMP", // Will update after getting sequence
        fullName: data.fullName.trim(),
        fatherName: data.fatherName.trim(),
        cnicHash,
        cnicMasked,
        phone: data.phone.trim(),
        email: data.email || null,
        districtId: data.districtId || null,
        tehsilId: data.tehsilId || null,
        tehsilCustom: data.tehsilCustom || null,
        unionCouncilId: data.unionCouncilId || null,
        unionCouncilCustom: data.unionCouncilCustom || null,
        postOfficeId: data.postOfficeId || null,
        postOfficeCustom: data.postOfficeCustom || null,
        constituencyId: data.constituencyId || null,
        areaId: data.areaId || null,
        areaCustom: data.areaCustom || null,
        address: data.address || null,
        categoryId: data.categoryId || null,
        subcategoryId: data.subcategoryId || null,
        description: data.description.trim(),
        additionalInfo: data.additionalInfo || null,
        language: data.language || "en",
        status: "submitted",
        priority: "normal",
        isDraft: false,
        trackingSecret,
        idempotencyKey,
        slaDeadline,
        slaStatus: "on_time",
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || null,
        submittedAt: now,
      })
      .returning();

    // Update tracking number with sequence
    const year = new Date().getFullYear();
    const trackingNumber = `JKADB-${year}-${String(complaint.sequenceNumber).padStart(6, "0")}`;

    await db
      .update(complaints)
      .set({ trackingNumber })
      .where(eq(complaints.id, complaint.id));

    // Insert initial status history
    await db.insert(statusHistory).values({
      complaintId: complaint.id,
      previousStatus: null,
      newStatus: "submitted",
      changedByName: data.fullName,
      reason: "Complaint submitted by citizen",
    });

    // Create notification for admins (targeting system)
    await db.insert(notifications).values({
      complaintId: complaint.id,
      type: "new_complaint",
      title: `New Complaint: ${trackingNumber}`,
      body: `A new complaint has been submitted in category ${data.categoryId ? "selected" : "other"}`,
    });

    return NextResponse.json({
      success: true,
      trackingNumber,
      complaintId: complaint.id,
      trackingSecret,
      submittedAt: now.toISOString(),
    });
  } catch (err) {
    console.error("Complaint submission error:", err);
    return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });
  }
}
