import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attachments, complaints } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const allowed = new Set(["image/jpeg","image/png","application/pdf"]);
const MAX = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const complaintId = String(form.get("complaintId") || "");
    const trackingSecret = String(form.get("trackingSecret") || "");
    const file = form.get("file");
    if (!complaintId || !trackingSecret || !(file instanceof File)) return NextResponse.json({error:"Invalid upload request"},{status:400});
    if (file.size <= 0 || file.size > MAX || !allowed.has(file.type)) return NextResponse.json({error:"Only JPG, JPEG, PNG and PDF files up to 5MB are allowed."},{status:400});
    const [complaint] = await db.select({id:complaints.id,trackingSecret:complaints.trackingSecret}).from(complaints).where(and(eq(complaints.id,complaintId),eq(complaints.trackingSecret,trackingSecret),eq(complaints.isDraft,false))).limit(1);
    if(!complaint)return NextResponse.json({error:"Upload authorization failed"},{status:403});
    const existing=await db.select().from(attachments).where(eq(attachments.complaintId,complaintId));
    if(existing.length>=5)return NextResponse.json({error:"Maximum 5 attachments per complaint."},{status:400});
    const safeExt = file.type==="application/pdf"?".pdf":file.type==="image/png"?".png":".jpg";
    const storageName=`${crypto.randomUUID()}${safeExt}`;
    const dir=path.join(process.cwd(),"private_uploads","complaints",complaintId);
    await fs.mkdir(dir,{recursive:true});
    const bytes=new Uint8Array(await file.arrayBuffer());
    await fs.writeFile(path.join(dir,storageName),bytes,{flag:"wx"});
    const [row]=await db.insert(attachments).values({complaintId,originalName:file.name.slice(0,255),storageName,mimeType:file.type,fileSize:file.size,isPublic:false}).returning();
    return NextResponse.json({attachment:{id:row.id,name:row.originalName,size:row.fileSize}});
  }catch{ return NextResponse.json({error:"Upload failed"},{status:500});}
}