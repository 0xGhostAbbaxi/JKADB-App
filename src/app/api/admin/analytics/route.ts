import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, districts, categories, departments, adminUsers } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { eq, and, gte, lte, count, avg, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const conditions = [eq(complaints.isDraft, false)];
    if (from) conditions.push(gte(complaints.submittedAt, new Date(from)));
    if (to) {
      const toD = new Date(to);
      toD.setHours(23, 59, 59, 999);
      conditions.push(lte(complaints.submittedAt, toD));
    }

    const whereClause = and(...conditions);

    // By category
    const byCategory = await db
      .select({
        categoryName: categories.nameEn,
        count: count(),
      })
      .from(complaints)
      .leftJoin(categories, eq(complaints.categoryId, categories.id))
      .where(whereClause)
      .groupBy(categories.nameEn)
      .orderBy(sql`count(*) DESC`);

    // By district
    const byDistrict = await db
      .select({
        districtName: districts.nameEn,
        count: count(),
      })
      .from(complaints)
      .leftJoin(districts, eq(complaints.districtId, districts.id))
      .where(whereClause)
      .groupBy(districts.nameEn)
      .orderBy(sql`count(*) DESC`);

    // By status
    const byStatus = await db
      .select({ status: complaints.status, count: count() })
      .from(complaints)
      .where(whereClause)
      .groupBy(complaints.status);

    // By priority
    const byPriority = await db
      .select({ priority: complaints.priority, count: count() })
      .from(complaints)
      .where(whereClause)
      .groupBy(complaints.priority);

    // By department
    const byDepartment = await db
      .select({
        departmentName: departments.nameEn,
        count: count(),
      })
      .from(complaints)
      .leftJoin(departments, eq(complaints.departmentId, departments.id))
      .where(whereClause)
      .groupBy(departments.nameEn)
      .orderBy(sql`count(*) DESC`);

    // Daily trend (last 30 days)
    const dailyTrend = await db.execute(sql`
      SELECT 
        DATE_TRUNC('day', submitted_at) as day,
        COUNT(*) as count
      FROM complaints
      WHERE is_draft = false
        AND submitted_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', submitted_at)
      ORDER BY day ASC
    `);

    // Monthly trend
    const monthlyTrend = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', submitted_at) as month,
        COUNT(*) as count,
        COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END) as resolved_count
      FROM complaints
      WHERE is_draft = false
        AND submitted_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', submitted_at)
      ORDER BY month ASC
    `);

    // SLA compliance
    const slaCompliance = await db.execute(sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN sla_status = 'on_time' THEN 1 END) as on_time,
        COUNT(CASE WHEN sla_status = 'approaching' THEN 1 END) as approaching,
        COUNT(CASE WHEN sla_status = 'overdue' THEN 1 END) as overdue
      FROM complaints
      WHERE is_draft = false
    `);

    // Officer workload
    const officerWorkload = await db
      .select({
        officerName: adminUsers.name,
        count: count(),
      })
      .from(complaints)
      .leftJoin(adminUsers, eq(complaints.assignedOfficerId, adminUsers.id))
      .where(and(whereClause, eq(complaints.status, "assigned")))
      .groupBy(adminUsers.name)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Resolution rate
    const resolutionRate = await db.execute(sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END) as resolved,
        ROUND(
          COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END)::numeric 
          / NULLIF(COUNT(*), 0) * 100, 2
        ) as rate
      FROM complaints
      WHERE is_draft = false
    `);

    return NextResponse.json({
      byCategory: byCategory.map((c) => ({ name: c.categoryName || "Unknown", count: Number(c.count) })),
      byDistrict: byDistrict.map((d) => ({ name: d.districtName || "Unknown", count: Number(d.count) })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
      byPriority: byPriority.map((p) => ({ priority: p.priority, count: Number(p.count) })),
      byDepartment: byDepartment.map((d) => ({ name: d.departmentName || "Unknown", count: Number(d.count) })),
      dailyTrend: dailyTrend.rows,
      monthlyTrend: monthlyTrend.rows,
      slaCompliance: slaCompliance.rows[0] || {},
      officerWorkload: officerWorkload.map((o) => ({ name: o.officerName || "Unassigned", count: Number(o.count) })),
      resolutionRate: resolutionRate.rows[0] || {},
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
