"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStatusLabel, getStatusColor, formatTimeAgo } from "@/lib/utils";

interface Complaint {
  id: string;
  trackingNumber: string;
  fullName: string;
  status: string;
  priority: string;
  submittedAt: string;
  districtName?: string;
  categoryName?: string;
}

export default function EscalationsPage() {
  const [escalated, setEscalated] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/complaints?status=escalated&limit=50")
      .then((r) => r.json())
      .then((d) => setEscalated(d.complaints || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Escalations</h1>
        <p className="text-gray-500 text-sm">{escalated.length} escalated complaints</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : escalated.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="font-bold text-green-900">No Escalated Complaints</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Complaint</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Citizen</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Submitted</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {escalated.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-gray-500">{c.trackingNumber}</code>
                    <p className="text-xs text-gray-400">{c.categoryName || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.fullName}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${getStatusColor(c.status)}`}>{getStatusLabel(c.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatTimeAgo(c.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/complaints/${c.id}`}
                      className="text-xs font-semibold text-red-800 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
