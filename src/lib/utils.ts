import { createHash, randomBytes } from "crypto";

export function generateTrackingNumber(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(6, "0");
  return `JKADB-${year}-${seq}`;
}

export function generateTrackingSecret(): string {
  return randomBytes(32).toString("hex");
}

export function hashCnic(cnic: string): string {
  const normalized = cnic.replace(/-/g, "");
  return createHash("sha256").update(normalized + "jkadb-salt-2026").digest("hex");
}

export function maskCnic(cnic: string): string {
  const normalized = cnic.replace(/-/g, "");
  if (normalized.length !== 13) return "***-*******-*";
  return `${normalized.substring(0, 5)}-*******-${normalized.substring(12)}`;
}

export function validateCnic(cnic: string): boolean {
  const normalized = cnic.replace(/-/g, "");
  return /^\d{13}$/.test(normalized);
}

export function formatCnic(cnic: string): string {
  const normalized = cnic.replace(/-/g, "");
  if (normalized.length !== 13) return cnic;
  return `${normalized.substring(0, 5)}-${normalized.substring(5, 12)}-${normalized.substring(12)}`;
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function getSlaDeadline(submittedAt: Date, hours: number): Date {
  const deadline = new Date(submittedAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

export function getSlaStatus(deadline: Date | null): "on_time" | "approaching" | "overdue" {
  if (!deadline) return "on_time";
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();
  const remainingHours = remaining / (1000 * 60 * 60);
  if (remainingHours < 0) return "overdue";
  if (remainingHours < 12) return "approaching";
  return "on_time";
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-PK");
}

export function getStatusLabel(status: string, lang: "en" | "ur" = "en"): string {
  const labels: Record<string, { en: string; ur: string }> = {
    submitted: { en: "Submitted", ur: "جمع کرایا" },
    verified: { en: "Verified", ur: "تصدیق شدہ" },
    assigned: { en: "Assigned", ur: "تفویض شدہ" },
    under_review: { en: "Under Review", ur: "زیر جائزہ" },
    investigation: { en: "Investigation", ur: "تحقیقات" },
    awaiting_response: { en: "Awaiting Response", ur: "جواب کا انتظار" },
    resolved: { en: "Resolved", ur: "حل شدہ" },
    citizen_confirmation: { en: "Awaiting Confirmation", ur: "تصدیق کا انتظار" },
    closed: { en: "Closed", ur: "بند" },
    rejected: { en: "Rejected", ur: "مسترد" },
    reopened: { en: "Reopened", ur: "دوبارہ کھولا" },
    duplicate: { en: "Duplicate", ur: "نقل" },
    invalid: { en: "Invalid", ur: "غیر درست" },
    escalated: { en: "Escalated", ur: "اعلی سطح پر بھیجا" },
    withdrawn: { en: "Withdrawn", ur: "واپس لیا" },
    awaiting_citizen_response: { en: "Awaiting Citizen Response", ur: "شہری جواب کا انتظار" },
  };
  return labels[status]?.[lang] || status;
}

export function getPriorityLabel(priority: string, lang: "en" | "ur" = "en"): string {
  const labels: Record<string, { en: string; ur: string }> = {
    normal: { en: "Normal", ur: "عام" },
    urgent: { en: "Urgent", ur: "فوری" },
    critical: { en: "Critical", ur: "اہم" },
  };
  return labels[priority]?.[lang] || priority;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    verified: "bg-indigo-100 text-indigo-800",
    assigned: "bg-purple-100 text-purple-800",
    under_review: "bg-yellow-100 text-yellow-800",
    investigation: "bg-orange-100 text-orange-800",
    awaiting_response: "bg-amber-100 text-amber-800",
    resolved: "bg-green-100 text-green-800",
    citizen_confirmation: "bg-teal-100 text-teal-800",
    closed: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
    reopened: "bg-pink-100 text-pink-800",
    duplicate: "bg-gray-100 text-gray-600",
    invalid: "bg-red-50 text-red-600",
    escalated: "bg-red-200 text-red-900",
    withdrawn: "bg-gray-100 text-gray-500",
    awaiting_citizen_response: "bg-cyan-100 text-cyan-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    normal: "bg-green-100 text-green-800",
    urgent: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return colors[priority] || "bg-gray-100 text-gray-800";
}
