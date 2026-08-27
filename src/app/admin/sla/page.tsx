"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, AlertTriangle } from "lucide-react";
import { getStatusLabel, getStatusColor, formatTimeAgo } from "@/lib/utils";

interface Complaint {
  id: string;
  trackingNumber: string;
  fullName: string;
  status: string;
  priority: string;
  submittedAt: string;
  slaDeadline?: string;
  slaStatus?: string;
  districtName?: string;
  categoryName?: string;
}

export default function SLAPage() {
  const [overdue, setOverdue] = useState<Complaint[]>([]);
  const [approaching, setApproaching] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/complaints?slaStatus=overdue&limit=50").then((r) => r.json()),
      fetch("/api/admin/complaints?slaStatus=approaching&limit=50").then((r) => r.json()),
    ]).then(([a, b]) => {
      setOverdue(a.complaints || []);
      setApproaching(b.complaints || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">SLA Monitor</h1>
        <p className="text-gray-500 text-sm">Track SLA compliance and deadlines</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-red-600" size={20} />
            <span className="font-bold text-red-900 text-lg">{overdue.length}</span>
          </div>
          <p className="text-red-700 font-semibold">Overdue Complaints</p>
          <p className="text-red-600 text-sm">SLA deadline exceeded</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-yellow-600" size={20} />
            <span className="font-bold text-yellow-900 text-lg">{approaching.length}</span>
          </div>
          <p className="text-yellow-700 font-semibold">Approaching Deadline</p>
          <p className="text-yellow-600 text-sm">Due within 12 hours</p>
        </div>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-red-50">
            <h3 className="font-bold text-red-900">🔴 Overdue Complaints ({overdue.length})</h3>
          </div>
          <div className="divide-y">
            {overdue.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <code className="text-xs font-mono text-gray-500">{c.trackingNumber}</code>
                  <p className="font-semibold text-gray-900 text-sm">{c.fullName}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`status-badge text-xs ${getStatusColor(c.status)}`}>{getStatusLabel(c.status)}</span>
                    {c.slaDeadline && (
                      <span className="text-xs text-red-600">Due: {new Date(c.slaDeadline).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <Link href={`/admin/complaints/${c.id}`}
                  className="px-3 py-1.5 bg-red-700 text-white rounded-lg text-xs font-bold min-h-0">
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approaching */}
      {approaching.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-yellow-50">
            <h3 className="font-bold text-yellow-900">🟡 Approaching Deadline ({approaching.length})</h3>
          </div>
          <div className="divide-y">
            {approaching.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <code className="text-xs font-mono text-gray-500">{c.trackingNumber}</code>
                  <p className="font-semibold text-gray-900 text-sm">{c.fullName}</p>
                  {c.slaDeadline && (
                    <p className="text-xs text-yellow-600 mt-1">Due: {new Date(c.slaDeadline).toLocaleString()}</p>
                  )}
                </div>
                <Link href={`/admin/complaints/${c.id}`}
                  className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-xs font-bold min-h-0">
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && overdue.length === 0 && approaching.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="font-bold text-green-900 text-lg">All SLAs On Track!</p>
          <p className="text-green-700 text-sm">No overdue or approaching deadline complaints</p>
        </div>
      )}
    </div>
  );
}
