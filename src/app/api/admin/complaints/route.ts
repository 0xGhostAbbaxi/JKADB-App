import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, districts, tehsils, categories, departments, adminUsers } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { eq, and, ilike, desc, asc, gte, lte, or, count, sql } from "drizzle-orm";
import type { complaintStatusEnum, priorityEnum, slaStatusEnum } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type ComplaintStatus = InferSelectModel<typeof complaints>["status"];
type ComplaintPriority = InferSelectModel<typeof complaints>["priority"];
type SlaStatus = InferSelectModel<typeof complaints>["slaStatus"];

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const districtId = searchParams.get("districtId");
    const categoryId = searchParams.get("categoryId");
    const departmentId = searchParams.get("departmentId");
    const officerId = searchParams.get("officerId");
    const search = searchParams.get("search");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const sortBy = searchParams.get("sortBy") || "submittedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const isRead = searchParams.get("isRead");
    const slaStatusParam = searchParams.get("slaStatus");

    // Build where conditions
    const conditions = [eq(complaints.isDraft, false)];

    if (status && status !== "all") {
      conditions.push(eq(complaints.status, status as ComplaintStatus));
    }
    if (priority && priority !== "all") {
      conditions.push(eq(complaints.priority, priority as ComplaintPriority));
    }
    if (districtId) conditions.push(eq(complaints.districtId, districtId));
    if (categoryId) conditions.push(eq(complaints.categoryId, categoryId));
    if (departmentId) conditions.push(eq(complaints.departmentId, departmentId));
    if (officerId) conditions.push(eq(complaints.assignedOfficerId, officerId));
    if (fromDate) conditions.push(gte(complaints.submittedAt, new Date(fromDate)));
    if (toDate) {
      const toD = new Date(toDate);
      toD.setHours(23, 59, 59, 999);
      conditions.push(lte(complaints.submittedAt, toD));
    }
    if (isRead === "false") conditions.push(eq(complaints.isRead, false));
    if (isRead === "true") conditions.push(eq(complaints.isRead, true));
    if (slaStatusParam) {
      const validSla = ["on_time", "approaching", "overdue"];
      if (validSla.includes(slaStatusParam)) {
        conditions.push(sql`${complaints.slaStatus} = ${slaStatusParam}`);
      }
    }

    if (search) {
      const searchLower = `%${search}%`;
      conditions.push(
        or(
          ilike(complaints.trackingNumber, searchLower),
          ilike(complaints.fullName, searchLower),
          ilike(complaints.fatherName, searchLower),
          ilike(complaints.description, searchLower)
        )!
      );
    }

    if (session.role === "district_admin" && session.districtId) {
      conditions.push(eq(complaints.districtId, session.districtId));
    }

    if (session.role === "complaint_officer") {
      conditions.push(eq(complaints.assignedOfficerId, session.id));
    }

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ count: count() })
      .from(complaints)
      .where(whereClause);

    const totalCount = Number(countResult?.count || 0);

    const orderFn = sortOrder === "asc" ? asc : desc;
    const orderCol = sortBy === "priority" ? complaints.priority : complaints.submittedAt;

    const data = await db
      .select({
        id: complaints.id,
        trackingNumber: complaints.trackingNumber,
        fullName: complaints.fullName,
        fatherName: complaints.fatherName,
        cnicMasked: complaints.cnicMasked,
        status: complaints.status,
        priority: complaints.priority,
        isRead: complaints.isRead,
        submittedAt: complaints.submittedAt,
        slaDeadline: complaints.slaDeadline,
        slaStatus: complaints.slaStatus,
        districtName: districts.nameEn,
        categoryName: categories.nameEn,
        departmentName: departments.nameEn,
        officerName: adminUsers.name,
        tehsilName: tehsils.nameEn,
      })
      .from(complaints)
      .leftJoin(districts, eq(complaints.districtId, districts.id))
      .leftJoin(tehsils, eq(complaints.tehsilId, tehsils.id))
      .leftJoin(categories, eq(complaints.categoryId, categories.id))
      .leftJoin(departments, eq(complaints.departmentId, departments.id))
      .leftJoin(adminUsers, eq(complaints.assignedOfficerId, adminUsers.id))
      .where(whereClause)
      .orderBy(orderFn(orderCol))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      complaints: data,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("Admin complaints error:", err);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}
