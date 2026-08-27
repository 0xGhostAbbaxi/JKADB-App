"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from "recharts";

interface AnalyticsData {
  byCategory: Array<{ name: string; count: number }>;
  byDistrict: Array<{ name: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  byDepartment: Array<{ name: string; count: number }>;
  dailyTrend: Array<{ day: string; count: string }>;
  monthlyTrend: Array<{ month: string; count: string; resolved_count: string }>;
  slaCompliance: { total: string; on_time: string; approaching: string; overdue: string };
  officerWorkload: Array<{ name: string; count: number }>;
  resolutionRate: { total: string; resolved: string; rate: string };
}

const COLORS = ["#146B3A", "#1A5C2A", "#D4A017", "#1E40AF", "#9333EA", "#EA580C", "#0891B2", "#4B5563"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-3xl animate-pulse">🖐️</div>
    </div>
  );

  if (!data) return <div className="text-red-500">Failed to load analytics</div>;

  const dailyData = data.dailyTrend.map((d) => ({
    day: new Date(d.day as string).toLocaleDateString("en", { month: "short", day: "numeric" }),
    count: parseInt(d.count as string),
  }));

  const monthlyData = data.monthlyTrend.map((m) => ({
    month: new Date(m.month as string).toLocaleString("en", { month: "short", year: "2-digit" }),
    total: parseInt(m.count as string),
    resolved: parseInt((m.resolved_count as string) || "0"),
  }));

  const sla = data.slaCompliance;
  const slaData = [
    { name: "On Time", value: parseInt((sla.on_time as string) || "0"), color: "#1A5C2A" },
    { name: "Approaching", value: parseInt((sla.approaching as string) || "0"), color: "#D4A017" },
    { name: "Overdue", value: parseInt((sla.overdue as string) || "0"), color: "#146B3A" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">Real-time complaint analytics from database</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints", value: sla.total || "0", icon: "📋", color: "#146B3A" },
          { label: "Resolution Rate", value: `${data.resolutionRate.rate || 0}%`, icon: "✅", color: "#1A5C2A" },
          { label: "Resolved", value: data.resolutionRate.resolved || "0", icon: "🎯", color: "#1A5C2A" },
          { label: "Overdue SLA", value: sla.overdue || "0", icon: "⏰", color: "#DC2626" },
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border">
            <div className="text-3xl mb-2">{metric.icon}</div>
            <div className="text-3xl font-black" style={{ color: metric.color }}>{metric.value}</div>
            <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily trend */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Daily Complaints (Last 30 Days)</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#146B3A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Monthly resolved vs total */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Monthly: Total vs Resolved</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#146B3A" name="Total" radius={[2,2,0,0]} />
                <Bar dataKey="resolved" fill="#1A5C2A" name="Resolved" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* By Category */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Complaints by Category</h3>
          {data.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.byCategory.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#146B3A" radius={[0,2,2,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* SLA Compliance */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">SLA Compliance</h3>
          {slaData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={slaData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {slaData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* By District */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Complaints by District</h3>
          {data.byDistrict.filter(d => d.name !== "Unknown").length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.byDistrict.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1A5C2A" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Officer Workload */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Officer Workload</h3>
          {data.officerWorkload.length > 0 ? (
            <div className="space-y-3">
              {data.officerWorkload.map((o, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-700 w-32 truncate">{o.name}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (o.count / (data.officerWorkload[0]?.count || 1)) * 100)}%`,
                          background: "#146B3A",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{o.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
