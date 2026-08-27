import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { advertisements } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { desc } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX = 5 * 1024 * 1024; // 5MB

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(advertisements).orderBy(desc(advertisements.createdAt));
  return NextResponse.json({ advertisements: rows });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !["super_admin", "district_admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const form = await req.formData();
    const title = String(form.get("title") || "").trim();
    const linkUrl = form.get("linkUrl") ? String(form.get("linkUrl")).trim() : null;
    const ctaLabel = form.get("ctaLabel") ? String(form.get("ctaLabel")).trim() : null;
    const isActive = String(form.get("isActive") || "false") === "true";
    const startsAt = form.get("startsAt") ? new Date(String(form.get("startsAt"))) : null;
    const endsAt = form.get("endsAt") ? new Date(String(form.get("endsAt"))) : null;
    const file = form.get("image");

    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ error: "An image is required." }, { status: 400 });
    }
    if (file.size > MAX || !allowed.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG or WEBP images up to 5MB are allowed." }, { status: 400 });
    }

    const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
    const storageName = `${crypto.randomUUID()}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "ads");
    await fs.mkdir(dir, { recursive: true });
    const bytes = new Uint8Array(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, storageName), bytes, { flag: "wx" });
    const imageUrl = `/uploads/ads/${storageName}`;

    const [row] = await db
      .insert(advertisements)
      .values({ title, imageUrl, linkUrl, ctaLabel, isActive, startsAt, endsAt, createdBy: session.id })
      .returning();

    await writeAudit(session, "advertisement_create", "advertisement", row.id, row.title);
    return NextResponse.json({ advertisement: row }, { status: 201 });
  } catch (err) {
    console.error("[advertisements] create failed", err);
    return NextResponse.json({ error: "Unable to create advertisement." }, { status: 400 });
  }
}
