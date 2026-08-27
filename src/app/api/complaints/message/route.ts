import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, complaints } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { rateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const messageSchema = z.object({
  trackingNumber: z.string(),
  verification: z.string().min(2),
  content: z.string().min(1).max(2000),
  senderName: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limitResult = rateLimit(`citizen_msg_${ip}`, 10, 60 * 60 * 1000);
  if (!limitResult.success) {
    return NextResponse.json({ error: "Too many messages" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { trackingNumber, verification, content, senderName } = parsed.data;

    // Verify complaint exists
    const [complaint] = await db
      .select()
      .from(complaints)
      .where(and(eq(complaints.trackingNumber, trackingNumber), eq(complaints.isDraft, false)))
      .limit(1);

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    // Basic verification
    const fatherNameNormalized = complaint.fatherName.toLowerCase().replace(/\s+/g, " ").trim();
    const verifNormalized = verification.toLowerCase().replace(/\s+/g, " ").trim();
    const verificationPassed =
      fatherNameNormalized.includes(verifNormalized) ||
      verifNormalized.includes(fatherNameNormalized) ||
      (verifNormalized.length >= 3 && fatherNameNormalized.includes(verifNormalized.substring(0, 3)));

    if (!verificationPassed) {
      return NextResponse.json({ error: "Verification failed" }, { status: 403 });
    }

    const [msg] = await db
      .insert(messages)
      .values({
        complaintId: complaint.id,
        messageType: "citizen",
        content: content.trim(),
        senderName: senderName.trim(),
      })
      .returning();

    return NextResponse.json({ success: true, message: msg });
  } catch (err) {
    console.error("Message error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
