import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { publicContactInformation } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(publicContactInformation).where(eq(publicContactInformation.isActive, true)).orderBy(publicContactInformation.sortOrder);
  return NextResponse.json({ contacts: rows });
}
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !["super_admin","district_admin"].includes(session.role)) return NextResponse.json({error:"Forbidden"},{status:403});
  try {
    const body = await req.json();
    const [row] = await db.insert(publicContactInformation).values({
      labelEn: String(body.labelEn || "").trim(), labelUr: body.labelUr || null,
      value: String(body.value || "").trim(), kind: body.kind || "general",
      sortOrder: Number(body.sortOrder || 0), isActive: body.isActive !== false,
    }).returning();
    await writeAudit(session, "contact_create", "public_contact_information", row.id, row.labelEn);
    return NextResponse.json({ contact: row }, {status:201});
  } catch { return NextResponse.json({error:"Unable to create contact"},{status:400}); }
}
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !["super_admin","district_admin"].includes(session.role)) return NextResponse.json({error:"Forbidden"},{status:403});
  try {
    const body = await req.json(); const id = String(body.id || "");
    const [before] = await db.select().from(publicContactInformation).where(eq(publicContactInformation.id,id)).limit(1);
    if (!before) return NextResponse.json({error:"Not found"},{status:404});
    const [row] = await db.update(publicContactInformation).set({
      labelEn: body.labelEn ?? before.labelEn, labelUr: body.labelUr ?? before.labelUr,
      value: body.value ?? before.value, kind: body.kind ?? before.kind,
      sortOrder: body.sortOrder ?? before.sortOrder, isActive: body.isActive ?? before.isActive,
      updatedAt: new Date(),
    }).where(eq(publicContactInformation.id,id)).returning();
    await writeAudit(session, "contact_update", "public_contact_information", id, row.labelEn, before, row);
    return NextResponse.json({contact:row});
  } catch { return NextResponse.json({error:"Unable to update contact"},{status:400}); }
}
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") return NextResponse.json({error:"Forbidden"},{status:403});
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({error:"id required"},{status:400});
  await db.update(publicContactInformation).set({isActive:false, updatedAt:new Date()}).where(eq(publicContactInformation.id,id));
  await writeAudit(session, "contact_disable", "public_contact_information", id);
  return NextResponse.json({success:true});
}