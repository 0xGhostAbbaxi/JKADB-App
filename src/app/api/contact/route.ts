import { NextResponse } from "next/server";
import { db } from "@/db";
import { publicContactInformation } from "@/db/schema";
import { and, eq } from "drizzle-orm";
export async function GET(){return NextResponse.json({contacts:await db.select().from(publicContactInformation).where(eq(publicContactInformation.isActive,true)).orderBy(publicContactInformation.sortOrder)});}