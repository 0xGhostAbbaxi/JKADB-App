import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, districts } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { sql, count, eq, and, gte, lt } from "drizzle-orm";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Total counts by status
    const statusCounts = await db
      .select({ status: complaints.status, count: count() })
      .from(complaints)
      .where(eq(complaints.isDraft, false))
      .groupBy(complaints.status);

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s) => {
      statusMap[s.status] = Number(s.count);
    });

    const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

    // Today's complaints
    const [todayResult] = await db
      .select({ count: count() })
      .from(complaints)
      .where(and(eq(complaints.isDraft, false), gte(complaints.submittedAt, todayStart)));
    const today = Number(todayResult?.count || 0);

    // This week
    const [weekResult] = await db
      .select({ count: count() })
      .from(complaints)
      .where(and(eq(complaints.isDraft, false), gte(complaints.submittedAt, weekStart)));
    const thisWeek = Number(weekResult?.count || 0);

    // Unread complaints
    const [unreadResult] = await db
      .select({ count: count() })
      .from(complaints)
      .where(and(eq(complaints.isDraft, false), eq(complaints.isRead, false)));
    const unread = Number(unreadResult?.count || 0);

    // Overdue (past SLA deadline)
    const overdueResult = await db
      .select({ count: count() })
      .from(complaints)
      .where(
        and(
          eq(complaints.isDraft, false),
          eq(complaints.slaStatus, "overdue")
        )
      );
    const overdue = Number(overdueResult[0]?.count || 0);

    // Priority counts
    const priorityCounts = await db
      .select({ priority: complaints.priority, count: count() })
      .from(complaints)
      .where(and(eq(complaints.isDraft, false)))
      .groupBy(complaints.priority);

    const priorityMap: Record<string, number> = {};
    priorityCounts.forEach((p) => {
      priorityMap[p.priority] = Number(p.count);
    });

    // By district
    const districtCounts = await db
      .select({
        districtId: complaints.districtId,
        districtName: districts.nameEn,
        count: count(),
      })
      .from(complaints)
      .leftJoin(districts, eq(complaints.districtId, districts.id))
      .where(eq(complaints.isDraft, false))
      .groupBy(complaints.districtId, districts.nameEn)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Recent complaints
    const recentComplaints = await db
      .select({
        id: complaints.id,
        trackingNumber: complaints.trackingNumber,
        fullName: complaints.fullName,
        status: complaints.status,
        priority: complaints.priority,
        submittedAt: complaints.submittedAt,
        isRead: complaints.isRead,
      })
      .from(complaints)
      .where(eq(complaints.isDraft, false))
      .orderBy(sql`${complaints.submittedAt} DESC`)
      .limit(10);

    // Monthly trend (last 6 months)
    const monthlyTrend = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', submitted_at) as month,
        COUNT(*) as count
      FROM complaints
      WHERE is_draft = false AND submitted_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', submitted_at)
      ORDER BY month ASC
    `);

    return NextResponse.json({
      stats: {
        total,
        today,
        thisWeek,
        unread,
        overdue,
        new: statusMap.submitted || 0,
        pending:
          (statusMap.submitted || 0) +
          (statusMap.verified || 0) +
          (statusMap.assigned || 0) +
          (statusMap.under_review || 0) +
          (statusMap.investigation || 0),
        assigned: statusMap.assigned || 0,
        underReview: statusMap.under_review || 0,
        resolved: statusMap.resolved || 0,
        closed: statusMap.closed || 0,
        rejected: statusMap.rejected || 0,
        reopened: statusMap.reopened || 0,
        escalated: statusMap.escalated || 0,
        normal: priorityMap.normal || 0,
        urgent: priorityMap.urgent || 0,
        critical: priorityMap.critical || 0,
      },
      districtCounts: districtCounts.map((d) => ({
        districtName: d.districtName || "Unknown",
        count: Number(d.count),
      })),
      recentComplaints,
      monthlyTrend: monthlyTrend.rows,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
