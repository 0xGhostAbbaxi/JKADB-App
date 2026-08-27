"use client";

import { useState, Suspense } from "react";
import { useApp } from "@/contexts/AppContext";
import CitizenNav from "@/components/CitizenNav";
import { Loader2, Search, AlertCircle, CheckCircle, Clock, MessageSquare, Send } from "lucide-react";
import { getStatusLabel, getPriorityLabel, getStatusColor, getPriorityColor, formatTimeAgo } from "@/lib/utils";

interface ComplaintData {
  id: string;
  trackingNumber: string;
  fullName: string;
  districtName?: string;
  tehsilName?: string;
  categoryName?: string;
  description: string;
  status: string;
  priority: string;
  departmentName?: string;
  officerName?: string;
  slaDeadline?: string;
  slaStatus?: string;
  resolvedAt?: string;
  resolutionDescription?: string;
  officialResponse?: string;
  submittedAt: string;
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

interface Feedback {
  id: string;
  rating: string;
  comment?: string;
}

export default function TrackComplaintPage() {
  const { lang } = useApp();
  const isUrdu = lang === "ur";
  const fontStyle = { fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif" };

  const [trackingNumber, setTrackingNumber] = useState("");
  const [verification, setVerification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    complaint: ComplaintData;
    statusHistory: StatusHistoryItem[];
    messages: Message[];
    feedback: Feedback | null;
  } | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<"resolved" | "partially" | "not_resolved">("resolved");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [requestReopen, setRequestReopen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleTrack = async () => {
    if (!trackingNumber.trim() || !verification.trim()) {
      setError(isUrdu ? "تمام خانے بھریں" : "Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/complaints/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim().toUpperCase(), verification: verification.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || (isUrdu ? "شکایت نہیں ملی" : "Complaint not found or verification failed"));
      }
    } catch {
      setError(isUrdu ? "کچھ غلط ہوگیا" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !result) return;
    setSendingMsg(true);
    try {
      const res = await fetch("/api/complaints/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: result.complaint.trackingNumber,
          verification: verification.trim(),
          content: newMessage.trim(),
          senderName: result.complaint.fullName,
        }),
      });
      if (res.ok) {
        setMsgSuccess(true);
        setNewMessage("");
        // Refresh
        await handleTrack();
        setTimeout(() => setMsgSuccess(false), 3000);
      }
    } catch {
    } finally {
      setSendingMsg(false);
    }
  };

  const submitFeedback = async () => {
    if (!result) return;
    setSubmittingFeedback(true);
    try {
      const res = await fetch("/api/complaints/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: result.complaint.trackingNumber,
          verification: verification.trim(),
          rating: feedbackRating,
          comment: feedbackComment || undefined,
          requestReopen,
          reopenReason: requestReopen ? reopenReason : undefined,
        }),
      });
      if (res.ok) {
        setShowFeedback(false);
        await handleTrack();
      }
    } catch {
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={fontStyle}>
      <CitizenNav currentPage="track" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Search form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-3xl">🔍</span>
            {isUrdu ? "شکایت ٹریک کریں" : "Track Your Complaint"}
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            {isUrdu
              ? "اپنا شکایت نمبر اور والد کا نام درج کریں"
              : "Enter your complaint reference and father's name for verification"}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                {isUrdu ? "شکایت نمبر *" : "Complaint Reference *"}
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100 uppercase"
                placeholder="JKADB-2026-000001"
                dir="ltr"
                style={{ fontFamily: "monospace", letterSpacing: "0.1em" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                {isUrdu ? "تصدیق: والد کا نام *" : "Verification: Father's Name *"}
              </label>
              <input
                type="text"
                value={verification}
                onChange={(e) => setVerification(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                placeholder={isUrdu ? "والد کا نام درج کریں" : "Enter father's name"}
                dir={isUrdu ? "rtl" : "ltr"}
              />
              <p className="text-xs text-gray-400 mt-1">
                {isUrdu ? "شناخت کے لیے والد کا نام استعمال ہوگا" : "Father's name is used for identity verification"}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleTrack}
              disabled={loading}
              className="w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ background: "#146B3A" }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              {isUrdu ? "ابھی ٹریک کریں" : "Track Now"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div
                className="p-6"
                style={{ background: "linear-gradient(135deg, #146B3A, #0B4D2A)" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-red-200 text-sm mb-1">{isUrdu ? "شکایت نمبر" : "Complaint ID"}</p>
                    <p className="text-white font-black text-xl tracking-wider" style={{ fontFamily: "monospace" }}>
                      {result.complaint.trackingNumber}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`status-badge ${getStatusColor(result.complaint.status)}`}>
                      {getStatusLabel(result.complaint.status, lang)}
                    </span>
                    <span className={`status-badge ${getPriorityColor(result.complaint.priority)}`}>
                      {getPriorityLabel(result.complaint.priority, lang)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{isUrdu ? "درخواست گزار" : "Complainant"}</p>
                    <p className="font-semibold text-gray-900">{result.complaint.fullName}</p>
                  </div>
                  {result.complaint.districtName && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{isUrdu ? "ضلع" : "District"}</p>
                      <p className="font-semibold text-gray-900">{result.complaint.districtName}</p>
                    </div>
                  )}
                  {result.complaint.categoryName && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{isUrdu ? "زمرہ" : "Category"}</p>
                      <p className="font-semibold text-gray-900">{result.complaint.categoryName}</p>
                    </div>
                  )}
                  {result.complaint.departmentName && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{isUrdu ? "محکمہ" : "Department"}</p>
                      <p className="font-semibold text-gray-900">{result.complaint.departmentName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{isUrdu ? "تاریخ جمع" : "Submitted"}</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(result.complaint.submittedAt).toLocaleDateString(isUrdu ? "ur-PK" : "en-PK")}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">{isUrdu ? "شکایت کی تفصیل" : "Description"}</p>
                  <p className="text-gray-800 text-sm leading-relaxed">{result.complaint.description}</p>
                </div>

                {/* SLA */}
                {result.complaint.slaDeadline && result.complaint.status !== "closed" && (
                  <div
                    className={`rounded-xl p-3 mb-4 ${
                      result.complaint.slaStatus === "overdue"
                        ? "bg-red-50 border border-red-200"
                        : result.complaint.slaStatus === "approaching"
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {result.complaint.slaStatus === "overdue" ? "🔴 " : result.complaint.slaStatus === "approaching" ? "🟡 " : "🟢 "}
                      {isUrdu ? "آخری تاریخ:" : "Deadline:"}{" "}
                      {new Date(result.complaint.slaDeadline).toLocaleString(isUrdu ? "ur-PK" : "en-PK")}
                    </p>
                  </div>
                )}

                {/* Resolution */}
                {result.complaint.resolutionDescription && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <p className="text-green-800 font-semibold text-sm mb-1">
                      ✅ {isUrdu ? "حل" : "Resolution"}
                    </p>
                    <p className="text-green-700 text-sm">{result.complaint.resolutionDescription}</p>
                  </div>
                )}

                {/* Feedback button for resolved complaints */}
                {result.complaint.status === "resolved" && !result.feedback && !showFeedback && (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="w-full py-3 rounded-xl font-bold text-white mb-2"
                    style={{ background: "#1A5C2A" }}
                  >
                    {isUrdu ? "کیا شکایت حل ہوئی؟ رائے دیں" : "Was your complaint resolved? Give feedback"}
                  </button>
                )}

                {/* Feedback form */}
                {showFeedback && (
                  <div className="border border-gray-200 rounded-xl p-4 mb-4">
                    <h4 className="font-bold text-gray-900 mb-4">
                      {isUrdu ? "کیا آپ کی شکایت حل ہوئی؟" : "Was your complaint resolved?"}
                    </h4>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { v: "resolved" as const, label: isUrdu ? "ہاں" : "Yes", color: "green" },
                        { v: "partially" as const, label: isUrdu ? "جزوی" : "Partially", color: "yellow" },
                        { v: "not_resolved" as const, label: isUrdu ? "نہیں" : "No", color: "red" },
                      ].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => {
                            setFeedbackRating(opt.v);
                            setRequestReopen(opt.v === "not_resolved");
                          }}
                          className={`py-2 px-3 rounded-xl border-2 font-semibold text-sm min-h-0 ${
                            feedbackRating === opt.v
                              ? opt.color === "green" ? "border-green-500 bg-green-50 text-green-700" :
                                opt.color === "yellow" ? "border-yellow-500 bg-yellow-50 text-yellow-700" :
                                "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-200 text-gray-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {requestReopen && (
                      <textarea
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-sm mb-3"
                        placeholder={isUrdu ? "دوبارہ کھولنے کی وجہ..." : "Reason for reopening..."}
                      />
                    )}
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-sm mb-3"
                      placeholder={isUrdu ? "اپنی رائے دیں..." : "Your comment (optional)..."}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={submitFeedback}
                        disabled={submittingFeedback}
                        className="flex-1 py-2 text-white rounded-xl font-bold text-sm"
                        style={{ background: "#146B3A" }}
                      >
                        {submittingFeedback ? "..." : isUrdu ? "جمع کروائیں" : "Submit"}
                      </button>
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600"
                      >
                        {isUrdu ? "منسوخ" : "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            {result.statusHistory.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={18} style={{ color: "#146B3A" }} />
                  {isUrdu ? "ٹائم لائن" : "Timeline"}
                </h3>
                <div className="space-y-4">
                  {result.statusHistory.map((h, i) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full mt-1"
                          style={{ background: i === result.statusHistory.length - 1 ? "#146B3A" : "#9CA3AF" }}
                        />
                        {i < result.statusHistory.length - 1 && (
                          <div className="w-px flex-1 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`status-badge text-xs ${getStatusColor(h.newStatus)}`}>
                            {getStatusLabel(h.newStatus, lang)}
                          </span>
                          <span className="text-xs text-gray-400">{formatTimeAgo(h.createdAt)}</span>
                        </div>
                        {h.reason && <p className="text-sm text-gray-600 mt-1">{h.reason}</p>}
                        {h.changedByName && (
                          <p className="text-xs text-gray-400 mt-0.5">by {h.changedByName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={18} style={{ color: "#146B3A" }} />
                {isUrdu ? "پیغامات" : "Messages"}
              </h3>

              {result.messages.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  {isUrdu ? "ابھی تک کوئی پیغام نہیں" : "No messages yet"}
                </p>
              ) : (
                <div className="space-y-4 mb-4">
                  {result.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-xl p-4 ${
                        msg.messageType === "citizen"
                          ? "bg-blue-50 border border-blue-100 ml-8"
                          : "bg-gray-50 border border-gray-100 mr-8"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-700">
                          {msg.messageType === "citizen" ? "👤 " : "🏛️ "}
                          {msg.senderName || (msg.messageType === "citizen" ? (isUrdu ? "شہری" : "Citizen") : (isUrdu ? "دفتر" : "Officer"))}
                        </span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(msg.createdAt)}</span>
                      </div>
                      <p className="text-gray-800 text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Send message */}
              {!["closed", "rejected", "withdrawn"].includes(result.complaint.status) && (
                <div className="border-t pt-4">
                  {msgSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-3 text-sm text-green-700">
                      <CheckCircle size={16} />
                      {isUrdu ? "پیغام بھیج دیا گیا" : "Message sent successfully"}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-red-800"
                      placeholder={isUrdu ? "پیغام لکھیں..." : "Type a message..."}
                      dir={isUrdu ? "rtl" : "ltr"}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMsg || !newMessage.trim()}
                      className="px-4 py-2 text-white rounded-xl font-bold disabled:opacity-50 min-h-0 self-end"
                      style={{ background: "#146B3A" }}
                    >
                      {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
