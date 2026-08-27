"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Eye, Clock, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { getStatusLabel, getStatusColor, getPriorityColor, getPriorityLabel, formatTimeAgo } from "@/lib/utils";
import { Suspense } from "react";

interface Complaint {
  id: string;
  trackingNumber: string;
  fullName: string;
  fatherName: string;
  cnicMasked: string;
  status: string;
  priority: string;
  isRead: boolean;
  submittedAt: string;
  slaDeadline?: string;
  slaStatus?: string;
  districtName?: string;
  categoryName?: string;
  departmentName?: string;
  officerName?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface District { id: string; nameEn: string; }
interface Category { id: string; nameEn: string; }

function ComplaintsPageInner() {
  const searchParams = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<District[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter state
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "all",
    priority: searchParams.get("priority") || "all",
    isRead: searchParams.get("isRead") || "",
    districtId: "",
    categoryId: "",
    search: "",
    fromDate: "",
    toDate: "",
    sortBy: "submittedAt",
    sortOrder: "desc",
    page: 1,
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/locations/districts").then((r) => r.json()).then((d) => setDistricts(d.districts || []));
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== "all" && v !== "") params.set(k, String(v));
    });

    try {
      const res = await fetch(`/api/admin/complaints?${params}`);
      const data = await res.json();
      setComplaints(data.complaints || []);
      setPagination(data.pagination);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const statuses = [
    "all", "submitted", "verified", "assigned", "under_review", "investigation",
    "awaiting_response", "resolved", "closed", "rejected", "reopened",
    "escalated", "duplicate", "invalid", "withdrawn", "awaiting_citizen_response"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Complaints</h1>
          <p className="text-gray-500 text-sm">
            {pagination ? `${pagination.total.toLocaleString()} total complaints` : "Loading..."}
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Search by ID, name, description..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-800"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium min-h-0 ${
              showFilters ? "bg-red-800 text-white border-red-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Quick status tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "submitted", "assigned", "under_review", "resolved", "closed", "rejected", "escalated"].map((s) => (
            <button
              key={s}
              onClick={() => setFilters({ ...filters, status: s, page: 1 })}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium min-h-0 ${
                filters.status === s
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={filters.status === s ? { background: "#146B3A" } : {}}
            >
              {getStatusLabel(s)}
            </button>
          ))}
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t">
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={filters.districtId}
              onChange={(e) => setFilters({ ...filters, districtId: e.target.value, page: 1 })}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.nameEn}</option>
              ))}
            </select>

            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nameEn}</option>
              ))}
            </select>

            <select
              value={filters.isRead}
              onChange={(e) => setFilters({ ...filters, isRead: e.target.value, page: 1 })}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="">All (Read/Unread)</option>
              <option value="false">Unread Only</option>
              <option value="true">Read Only</option>
            </select>

            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value, page: 1 })}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
              placeholder="From Date"
            />

            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value, page: 1 })}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
              placeholder="To Date"
            />

            <button
              onClick={() => setFilters({
                status: "all", priority: "all", isRead: "", districtId: "",
                categoryId: "", search: "", fromDate: "", toDate: "",
                sortBy: "submittedAt", sortOrder: "desc", page: 1,
              })}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 min-h-0 col-span-2"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-3xl mb-3 animate-pulse">🖐️</div>
              <p className="text-gray-400 text-sm">Loading complaints...</p>
            </div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500">No complaints found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Complaint ID</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Citizen</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Location</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Priority</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">SLA</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Submitted</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {complaints.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-gray-50 ${!c.isRead ? "bg-blue-50/20" : ""} ${
                        c.priority === "critical" ? "priority-critical" : c.priority === "urgent" ? "priority-urgent" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!c.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                          <code className="text-xs font-mono text-gray-600">{c.trackingNumber}</code>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.fullName}</p>
                          <p className="text-xs text-gray-400">{c.fatherName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{c.districtName || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{c.categoryName || "—"}</td>
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
                      <td className="px-4 py-3">
                        {c.slaStatus ? (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              c.slaStatus === "overdue"
                                ? "bg-red-100 text-red-700"
                                : c.slaStatus === "approaching"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {c.slaStatus === "overdue" ? "⏰ Overdue" : c.slaStatus === "approaching" ? "⚠ Due Soon" : "✓ On Time"}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTimeAgo(c.submittedAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/complaints/${c.id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-red-800 hover:underline min-h-0"
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

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 min-h-0"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page >= pagination.pages}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 min-h-0"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-4xl animate-pulse">🖐️</div></div>}>
      <ComplaintsPageInner />
    </Suspense>
  );
}
