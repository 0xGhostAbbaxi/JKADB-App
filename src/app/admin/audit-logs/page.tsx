"use client";

import { useEffect, useState } from "react";
import { formatTimeAgo } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLog {
  id: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetDescription?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ total: number; pages: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/audit-logs?page=${page}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || []);
        setPagination(d.pagination);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const actionColors: Record<string, string> = {
    admin_login: "text-blue-600 bg-blue-50",
    admin_logout: "text-gray-600 bg-gray-50",
    create_user: "text-green-600 bg-green-50",
    change_status: "text-purple-600 bg-purple-50",
    assign_complaint: "text-indigo-600 bg-indigo-50",
    resolve_complaint: "text-green-700 bg-green-100",
    create_announcement: "text-amber-600 bg-amber-50",
    create_category: "text-pink-600 bg-pink-50",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 text-sm">Immutable record of all system actions</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
        🔒 Audit logs are immutable. No records can be modified or deleted.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-3xl animate-pulse">🖐️</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Time</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Actor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Action</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Target</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatTimeAgo(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.actorName || "System"}</p>
                          <p className="text-xs text-gray-400">{log.actorRole?.replace("_", " ")}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            actionColors[log.action] || "text-gray-600 bg-gray-50"
                          }`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs text-gray-600">{log.targetType}</p>
                          <p className="text-xs text-gray-400 truncate max-w-48">{log.targetDescription}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ipAddress || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-sm text-gray-500">
                  Page {page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-100 min-h-0">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage(page + 1)} disabled={page >= pagination.pages} className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-100 min-h-0">
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
