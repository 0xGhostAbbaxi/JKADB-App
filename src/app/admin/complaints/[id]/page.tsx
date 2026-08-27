"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Clock, CheckCircle, AlertTriangle, User, MapPin, Tag,
  MessageSquare, FileText, Send, Loader2, ChevronDown
} from "lucide-react";
import { getStatusLabel, getStatusColor, getPriorityColor, getPriorityLabel, formatTimeAgo } from "@/lib/utils";

interface ComplaintDetail {
  id: string;
  trackingNumber: string;
  fullName: string;
  fatherName: string;
  cnicMasked: string;
  phone?: string;
  email?: string;
  description: string;
  additionalInfo?: string;
  status: string;
  priority: string;
  submittedAt: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolutionDescription?: string;
  officialResponse?: string;
  slaDeadline?: string;
  slaStatus?: string;
  district?: { id: string; nameEn: string };
  tehsil?: { id: string; nameEn: string };
  unionCouncil?: { id: string; nameEn: string };
  constituency?: { id: string; nameEn: string; code?: string };
  category?: { id: string; nameEn: string };
  subcategory?: { id: string; nameEn: string };
  department?: { id: string; nameEn: string };
  officer?: { id: string; name: string; designation?: string };
}

interface StatusHistoryItem {
  id: string;
  previousStatus?: string;
  newStatus: string;
  changedByName?: string;
  reason?: string;
  createdAt: string;
}

interface Message {
  id: string;
  messageType: string;
  content: string;
  senderName?: string;
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  role: string;
}

interface Department {
  id: string;
  nameEn: string;
}

interface Officer {
  id: string;
  name: string;
  role: string;
}

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [internalNotes, setInternalNotes] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "messages" | "notes" | "history">("details");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [replyMsg, setReplyMsg] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [assignOfficerId, setAssignOfficerId] = useState("");
  const [assignDeptId, setAssignDeptId] = useState("");
  const [reason, setReason] = useState("");
  const [resolutionDesc, setResolutionDesc] = useState("");
  const [officialResp, setOfficialResp] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/complaints/${id}`);
      const data = await res.json();
      setComplaint(data.complaint);
      setStatusHistory(data.statusHistory || []);
      setMessages(data.messages || []);
      setInternalNotes(data.internalNotes || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetch("/api/admin/departments").then((r) => r.json()).then((d) => setDepartments(d.departments || []));
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setOfficers(d.users || []));
  }, [id]);

  const doAction = async (action: string, extra: Record<string, unknown> = {}) => {
    setActionLoading(true);
    setActionSuccess("");
    setActionError("");
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess("Action completed successfully");
        await fetchData();
        setTimeout(() => setActionSuccess(""), 3000);
      } else {
        setActionError(data.error || "Action failed");
      }
    } catch {
      setActionError("Connection error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-3xl animate-pulse">🖐️</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Complaint not found</p>
        <Link href="/admin/complaints" className="text-red-800 hover:underline text-sm mt-2 block">
          ← Back to Complaints
        </Link>
      </div>
    );
  }

  const statuses = [
    "submitted", "verified", "assigned", "under_review", "investigation",
    "awaiting_response", "resolved", "citizen_confirmation", "closed",
    "rejected", "reopened", "escalated", "withdrawn", "awaiting_citizen_response"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/complaints" className="p-2 rounded-xl border hover:bg-gray-50 min-h-0 shrink-0 mt-1">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <code className="text-lg font-black tracking-wider text-gray-800" style={{ fontFamily: "monospace" }}>
              {complaint.trackingNumber}
            </code>
            <span className={`status-badge ${getStatusColor(complaint.status)}`}>
              {getStatusLabel(complaint.status)}
            </span>
            <span className={`status-badge ${getPriorityColor(complaint.priority)}`}>
              {getPriorityLabel(complaint.priority)}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Submitted {formatTimeAgo(complaint.submittedAt)} by {complaint.fullName}
          </p>
        </div>
      </div>

      {/* Success/Error */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
          <CheckCircle size={16} />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertTriangle size={16} />
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {[
              { key: "details", label: "Details", icon: FileText },
              { key: "messages", label: `Messages (${messages.length})`, icon: MessageSquare },
              { key: "notes", label: `Notes (${internalNotes.length})`, icon: FileText },
              { key: "history", label: "Timeline", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold min-h-0 transition-all ${
                    activeTab === tab.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Details tab */}
          {activeTab === "details" && (
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
              {/* Citizen Info */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={16} />
                  Citizen Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-semibold">{complaint.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Father Name</p>
                    <p className="font-semibold">{complaint.fatherName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">CNIC (Masked)</p>
                    <p className="font-semibold font-mono">{complaint.cnicMasked}</p>
                  </div>
                  {complaint.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-semibold">{complaint.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="border-t pt-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {complaint.district && (
                    <div>
                      <p className="text-xs text-gray-500">District</p>
                      <p className="font-semibold">{complaint.district.nameEn}</p>
                    </div>
                  )}
                  {complaint.tehsil && (
                    <div>
                      <p className="text-xs text-gray-500">Tehsil</p>
                      <p className="font-semibold">{complaint.tehsil.nameEn}</p>
                    </div>
                  )}
                  {complaint.constituency && (
                    <div>
                      <p className="text-xs text-gray-500">Constituency</p>
                      <p className="font-semibold">
                        {complaint.constituency.code && `${complaint.constituency.code} — `}
                        {complaint.constituency.nameEn}
                      </p>
                    </div>
                  )}
                  {complaint.unionCouncil && (
                    <div>
                      <p className="text-xs text-gray-500">Union Council</p>
                      <p className="font-semibold">{complaint.unionCouncil.nameEn}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Complaint */}
              <div className="border-t pt-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag size={16} />
                  Complaint Details
                </h3>
                {complaint.category && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-semibold">
                      {complaint.category.nameEn}
                      {complaint.subcategory && ` → ${complaint.subcategory.nameEn}`}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                </div>
                {complaint.additionalInfo && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Additional Info</p>
                    <p className="text-gray-700 text-sm">{complaint.additionalInfo}</p>
                  </div>
                )}
              </div>

              {/* Resolution */}
              {complaint.resolutionDescription && (
                <div className="border-t pt-5">
                  <h3 className="font-bold text-green-700 mb-3">✅ Resolution</h3>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-green-800 text-sm">{complaint.resolutionDescription}</p>
                  </div>
                  {complaint.officialResponse && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs text-blue-600 font-medium mb-1">Official Response</p>
                      <p className="text-blue-800 text-sm">{complaint.officialResponse}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Messages tab */}
          {activeTab === "messages" && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Citizen Messages</h3>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-xl p-4 ${
                        msg.messageType === "citizen"
                          ? "bg-blue-50 border border-blue-100"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">
                          {msg.messageType === "citizen" ? "👤 " : "🏛️ "}
                          {msg.senderName || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(msg.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reply to Citizen</label>
                <textarea
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-red-800"
                  placeholder="Type your reply..."
                />
                <button
                  onClick={() => {
                    doAction("reply", { message: replyMsg });
                    setReplyMsg("");
                  }}
                  disabled={!replyMsg.trim() || actionLoading}
                  className="mt-2 flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50 min-h-0"
                  style={{ background: "#146B3A" }}
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send Reply
                </button>
              </div>
            </div>
          )}

          {/* Internal Notes tab */}
          {activeTab === "notes" && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-2">Internal Notes</h3>
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
                🔒 These notes are NEVER visible to citizens
              </p>
              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {internalNotes.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No internal notes yet</p>
                ) : (
                  internalNotes.map((note) => (
                    <div key={note.id} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-amber-700">🔒 {note.senderName}</span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(note.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t pt-4">
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm resize-none focus:outline-none bg-amber-50"
                  placeholder="Add internal note (not visible to citizen)..."
                />
                <button
                  onClick={() => {
                    doAction("internal_note", { message: internalNote });
                    setInternalNote("");
                  }}
                  disabled={!internalNote.trim() || actionLoading}
                  className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 min-h-0"
                >
                  Add Note
                </button>
              </div>
            </div>
          )}

          {/* Timeline tab */}
          {activeTab === "history" && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Status Timeline</h3>
              <div className="space-y-4">
                {statusHistory.map((h, i) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                        style={{ background: i === statusHistory.length - 1 ? "#146B3A" : "#D1D5DB" }}
                      />
                      {i < statusHistory.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {h.previousStatus && (
                          <>
                            <span className={`status-badge text-xs ${getStatusColor(h.previousStatus)}`}>
                              {getStatusLabel(h.previousStatus)}
                            </span>
                            <span className="text-gray-400 text-xs">→</span>
                          </>
                        )}
                        <span className={`status-badge text-xs ${getStatusColor(h.newStatus)}`}>
                          {getStatusLabel(h.newStatus)}
                        </span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(h.createdAt)}</span>
                      </div>
                      {h.reason && <p className="text-sm text-gray-600">{h.reason}</p>}
                      {h.changedByName && <p className="text-xs text-gray-400">by {h.changedByName}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          {/* SLA */}
          {complaint.slaDeadline && (
            <div
              className={`rounded-2xl p-4 ${
                complaint.slaStatus === "overdue" ? "bg-red-50 border border-red-200" :
                complaint.slaStatus === "approaching" ? "bg-yellow-50 border border-yellow-200" :
                "bg-green-50 border border-green-200"
              }`}
            >
              <p className="font-bold text-sm mb-1">
                {complaint.slaStatus === "overdue" ? "🔴 OVERDUE" :
                 complaint.slaStatus === "approaching" ? "🟡 Due Soon" : "🟢 On Time"}
              </p>
              <p className="text-xs text-gray-600">
                Deadline: {new Date(complaint.slaDeadline).toLocaleString()}
              </p>
            </div>
          )}

          {/* Status change */}
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Change Status</h4>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-2"
            >
              <option value="">Select new status...</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{getStatusLabel(s)}</option>
              ))}
            </select>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-2"
            />
            <button
              onClick={() => doAction("status", { status: newStatus, reason })}
              disabled={!newStatus || actionLoading}
              className="w-full py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50 min-h-0"
              style={{ background: "#146B3A" }}
            >
              Update Status
            </button>
          </div>

          {/* Priority */}
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Change Priority</h4>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-2"
            >
              <option value="">Select priority...</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
            <button
              onClick={() => doAction("priority", { priority: newPriority })}
              disabled={!newPriority || actionLoading}
              className="w-full py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50 min-h-0"
              style={{ background: "#D4A017" }}
            >
              Update Priority
            </button>
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Assign / Transfer</h4>
            <select
              value={assignDeptId}
              onChange={(e) => setAssignDeptId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-2"
            >
              <option value="">Select Department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.nameEn}</option>
              ))}
            </select>
            <select
              value={assignOfficerId}
              onChange={(e) => setAssignOfficerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-2"
            >
              <option value="">Select Officer...</option>
              {officers.filter((o) => ["complaint_officer", "reviewer"].includes(o.role)).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <button
              onClick={() => doAction("assign", { officerId: assignOfficerId, departmentId: assignDeptId })}
              disabled={actionLoading}
              className="w-full py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50 min-h-0"
              style={{ background: "#1A5C2A" }}
            >
              Assign
            </button>
          </div>

          {/* Resolve */}
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Resolve Complaint</h4>
            <textarea
              value={resolutionDesc}
              onChange={(e) => setResolutionDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-2 resize-none"
              placeholder="Resolution description..."
            />
            <textarea
              value={officialResp}
              onChange={(e) => setOfficialResp(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-2 resize-none"
              placeholder="Official response to citizen..."
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => doAction("resolve", { resolutionDescription: resolutionDesc, officialResponse: officialResp, reason: "Resolved" })}
                disabled={actionLoading}
                className="py-2 bg-green-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 min-h-0"
              >
                ✅ Resolve
              </button>
              <button
                onClick={() => doAction("reject", { reason: reason || "Rejected" })}
                disabled={actionLoading}
                className="py-2 bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 min-h-0"
              >
                ✗ Reject
              </button>
            </div>
          </div>

          {/* Escalate */}
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Escalate</h4>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Escalation reason..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-2"
            />
            <button
              onClick={() => doAction("escalate", { reason })}
              disabled={actionLoading}
              className="w-full py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 min-h-0"
            >
              ↑ Escalate
            </button>
          </div>

          {/* Current assignment info */}
          {(complaint.department || complaint.officer) && (
            <div className="bg-gray-50 rounded-2xl p-4 text-sm">
              <h4 className="font-bold text-gray-700 mb-2">Current Assignment</h4>
              {complaint.department && (
                <p className="text-gray-600">🏛️ {complaint.department.nameEn}</p>
              )}
              {complaint.officer && (
                <p className="text-gray-600">👤 {complaint.officer.name}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
