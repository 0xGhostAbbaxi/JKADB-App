import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements, auditLogs } from "@/db/schema";
import { getAdminSession, hasPermission } from "@/lib/auth";
import { eq, and, lte, gte, desc, or, isNull } from "drizzle-orm";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "true";

    const session = isAdmin ? await getAdminSession() : null;

    if (isAdmin && !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    let data;
    if (isAdmin) {
      data = await db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.createdAt));
    } else {
      // Public: only published and not expired
      data = await db
        .select({
          id: announcements.id,
          titleEn: announcements.titleEn,
          titleUr: announcements.titleUr,
          descriptionEn: announcements.descriptionEn,
          descriptionUr: announcements.descriptionUr,
          bannerUrl: announcements.bannerUrl,
          priority: announcements.priority,
          isPersistent: announcements.isPersistent,
          isPopup: announcements.isPopup,
          publishAt: announcements.publishAt,
          expiresAt: announcements.expiresAt,
        })
        .from(announcements)
        .where(
          and(
            eq(announcements.status, "published"),
            or(isNull(announcements.publishAt), lte(announcements.publishAt, now)),
            or(isNull(announcements.expiresAt), gte(announcements.expiresAt, now))
          )
        )
        .orderBy(desc(announcements.priority), desc(announcements.createdAt));
    }

    return NextResponse.json({ announcements: data });
  } catch (err) {
    console.error("Announcements error:", err);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

const announcementSchema = z.object({
  titleEn: z.string().min(1),
  titleUr: z.string().optional(),
  descriptionEn: z.string().min(1),
  descriptionUr: z.string().optional(),
  bannerUrl: z.string().optional(),
  status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
  priority: z.number().optional(),
  publishAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isPersistent: z.boolean().optional(),
  isPopup: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !hasPermission(session.role, ["district_admin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data = parsed.data;
    const [ann] = await db
      .insert(announcements)
      .values({
        ...data,
        publishAt: data.publishAt ? new Date(data.publishAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        createdBy: session.id,
      })
      .returning();

    await db.insert(auditLogs).values({
      actorId: session.id,
      actorName: session.name,
      actorRole: session.role,
      action: "create_announcement",
      targetType: "announcement",
      targetId: ann.id,
      targetDescription: `Created: ${ann.titleEn}`,
    });

    return NextResponse.json({ announcement: ann });
  } catch (err) {
    console.error("Create announcement error:", err);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !hasPermission(session.role, ["district_admin"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id || "");
    const [before] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const parsed = announcementSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const d = parsed.data;
    const [ann] = await db.update(announcements).set({
      ...d,
      publishAt: d.publishAt === undefined ? before.publishAt : d.publishAt ? new Date(d.publishAt) : null,
      expiresAt: d.expiresAt === undefined ? before.expiresAt : d.expiresAt ? new Date(d.expiresAt) : null,
      updatedAt: new Date(),
    }).where(eq(announcements.id,id)).returning();
    await db.insert(auditLogs).values({actorId:session.id,actorName:session.name,actorRole:session.role,action:"update_announcement",targetType:"announcement",targetId:id,targetDescription:ann.titleEn,previousValue:before,newValue:ann});
    return NextResponse.json({announcement:ann});
  } catch { return NextResponse.json({error:"Failed to update announcement"},{status:400}); }
}
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") return NextResponse.json({error:"Unauthorized"},{status:401});
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({error:"id required"},{status:400});
  await db.update(announcements).set({status:"archived",updatedAt:new Date()}).where(eq(announcements.id,id));
  await db.insert(auditLogs).values({actorId:session.id,actorName:session.name,actorRole:session.role,action:"archive_announcement",targetType:"announcement",targetId:id});
  return NextResponse.json({success:true});
}
