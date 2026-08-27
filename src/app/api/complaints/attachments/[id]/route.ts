import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attachments, complaints } from "@/db/schema";
import { eq } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";
import { getAdminSession } from "@/lib/auth";

export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params; const [row]=await db.select().from(attachments).where(eq(attachments.id,id)).limit(1); if(!row)return NextResponse.json({error:"Not found"},{status:404});
 const admin=await getAdminSession(); const secret=new URL(req.url).searchParams.get("trackingSecret");
 const [c]=await db.select({secret:complaints.trackingSecret}).from(complaints).where(eq(complaints.id,row.complaintId)).limit(1);
 if(!admin && (!secret || secret!==c?.secret)) return NextResponse.json({error:"Forbidden"},{status:403});
 try{const bytes=await fs.readFile(path.join(process.cwd(),"private_uploads","complaints",row.complaintId,row.storageName));return new NextResponse(bytes,{headers:{"Content-Type":row.mimeType,"Content-Disposition":`inline; filename="${row.originalName.replace(/["\\\r\n]/g,"")}"`,"Cache-Control":"private, no-store"}});}catch{return NextResponse.json({error:"File unavailable"},{status:404});}
}