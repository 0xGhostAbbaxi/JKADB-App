"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, AlertTriangle, Clock, CheckCircle, XCircle, RotateCcw,
  ArrowUpCircle, TrendingUp, Users, Bell, Eye, Zap
} from "lucide-react";
import { getStatusLabel, getStatusColor, getPriorityColor, getPriorityLabel, formatTimeAgo } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from "recharts";

interface DashboardData {
  stats: {
    total: number;
    today: number;
    thisWeek: number;
    unread: number;
    overdue: number;
    new: number;
    pending: number;
    assigned: number;
    underReview: number;
    resolved: number;
    closed: number;
    rejected: number;
    reopened: number;
    escalated: number;
    normal: number;
    urgent: number;
    critical: number;
  };
  districtCounts: Array<{ districtName: string; count: number }>;
  recentComplaints: Array<{
    id: string;
    trackingNumber: string;
    fullName: string;
    status: string;
    priority: string;
    submittedAt: string;
    isRead: boolean;
  }>;
  monthlyTrend: Array<{ month: string; count: string }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then(async (r) => { if (r.status === 401) { window.location.replace("/admin/login"); return null; } return r.json(); })
      .then((d) => d && setData(d))
      .finally(() => setLoading(false));

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetch("/api/admin/dashboard")
        .then((r) => r.json())
        .then(setData);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🖐️</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-red-500 p-4">Failed to load dashboard</div>;

  const stats = data.stats;

  const statCards = [
    { label: "Total", value: stats.total, icon: FileText, color: "blue", href: "/admin/complaints" },
    { label: "Today", value: stats.today, icon: TrendingUp, color: "green", href: "/admin/complaints" },
    { label: "Unread", value: stats.unread, icon: Bell, color: "red", href: "/admin/complaints?isRead=false" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "yellow", href: "/admin/complaints?status=submitted" },
    { label: "Assigned", value: stats.assigned, icon: Users, color: "purple", href: "/admin/complaints?status=assigned" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "green", href: "/admin/complaints?status=resolved" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "red", href: "/admin/sla" },
    { label: "Escalated", value: stats.escalated, icon: ArrowUpCircle, color: "orange", href: "/admin/escalations" },
    { label: "Critical", value: stats.critical, icon: Zap, color: "red", href: "/admin/complaints?priority=critical" },
    { label: "Urgent", value: stats.urgent, icon: AlertTriangle, color: "orange", href: "/admin/complaints?priority=urgent" },
    { label: "Reopened", value: stats.reopened, icon: RotateCcw, color: "pink", href: "/admin/complaints?status=reopened" },
    { label: "Closed", value: stats.closed, icon: XCircle, color: "gray", href: "/admin/complaints?status=closed" },
  ];

  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    yellow: "text-yellow-600 bg-yellow-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    pink: "text-pink-600 bg-pink-50",
    gray: "text-gray-600 bg-gray-50",
  };

  const trendData = data.monthlyTrend.map((m) => ({
    month: new Date(m.month as string).toLocaleString("en", { month: "short" }),
    count: parseInt(m.count as string),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time complaint management overview</p>
        </div>
        <div className="text-sm text-gray-400">
          Updated {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Alert banners */}
      {stats.critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-red-900">{stats.critical} Critical Complaint{stats.critical > 1 ? "s" : ""}</p>
            <p className="text-red-700 text-sm">Require immediate attention</p>
          </div>
          <Link
            href="/admin/complaints?priority=critical"
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold min-h-0"
          >
            View Now
          </Link>
        </div>
      )}

      {stats.overdue > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-bold text-orange-900">{stats.overdue} Overdue Complaint{stats.overdue > 1 ? "s" : ""}</p>
            <p className="text-orange-700 text-sm">SLA deadlines exceeded</p>
          </div>
          <Link
            href="/admin/sla"
            className="ml-auto px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold min-h-0"
          >
            View SLA
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 group"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
                <Icon size={16} />
              </div>
              <div className="text-2xl font-black text-gray-900">{card.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{card.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Monthly Complaint Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#146B3A" strokeWidth={2} dot={{ fill: "#146B3A" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No trend data yet
            </div>
          )}
        </div>

        {/* District breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Top Districts</h3>
          {data.districtCounts.length > 0 ? (
            <div className="space-y-3">
              {data.districtCounts.slice(0, 6).map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-4">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{d.districtName}</span>
                      <span className="font-bold text-gray-900">{d.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, (d.count / (data.districtCounts[0]?.count || 1)) * 100)}%`,
                          background: "#146B3A",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data yet</p>
          )}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Complaints</h3>
          <Link href="/admin/complaints" className="text-sm text-red-800 font-semibold hover:underline">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Citizen</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Priority</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Submitted</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recentComplaints.map((c) => (
                <tr key={c.id} className={`hover:bg-gray-50 ${!c.isRead ? "bg-blue-50/30" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!c.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                      <code className="text-xs font-mono text-gray-600">{c.trackingNumber}</code>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.fullName}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${getStatusColor(c.status)}`}>
                      {getStatusLabel(c.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${getPriorityColor(c.priority)}`}>
                      {getPriorityLabel(c.priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatTimeAgo(c.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/complaints/${c.id}`}
                      className="text-xs font-semibold text-red-800 hover:underline flex items-center gap-1 min-h-0"
                    >
                      <Eye size={12} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
