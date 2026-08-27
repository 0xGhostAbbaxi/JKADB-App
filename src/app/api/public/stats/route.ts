import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function GET() {
  try {
    const totalsResult = await db.execute(sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END) as resolved,
        COUNT(CASE WHEN status NOT IN ('resolved', 'closed', 'rejected', 'duplicate', 'invalid', 'withdrawn') THEN 1 END) as active,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical
      FROM complaints
      WHERE is_draft = false
    `);

    const byCategory = await db.execute(sql`
      SELECT 
        cat.name_en as category,
        COUNT(*) as count
      FROM complaints c
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.is_draft = false
      GROUP BY cat.name_en
      ORDER BY count DESC
      LIMIT 5
    `);

    const byDistrict = await db.execute(sql`
      SELECT 
        d.name_en as district,
        COUNT(*) as count
      FROM complaints c
      JOIN districts d ON c.district_id = d.id
      WHERE c.is_draft = false
      GROUP BY d.name_en
      ORDER BY count DESC
      LIMIT 5
    `);

    return NextResponse.json({
      stats: totalsResult.rows[0] || { total: 0, resolved: 0, active: 0, critical: 0 },
      byCategory: byCategory.rows,
      byDistrict: byDistrict.rows,
    });
  } catch (err) {
    console.error("Public stats error:", err);
    return NextResponse.json({
      stats: { total: 0, resolved: 0, active: 0, critical: 0 },
      byCategory: [],
      byDistrict: [],
    });
  }
}
