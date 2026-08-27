"use client";

import { useEffect, useState } from "react";
import { Plus, Megaphone } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface Announcement {
  id: string;
  titleEn: string;
  titleUr?: string | null;
  descriptionEn: string;
  status: string;
  priority?: number | null;
  publishAt?: string | null;
  expiresAt?: string | null;
  isPersistent?: boolean | null;
  createdAt: string;
}

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titleEn: "", titleUr: "", descriptionEn: "", descriptionUr: "",
    status: "published" as "draft" | "scheduled" | "published" | "archived",
    priority: 0, isPersistent: false, publishAt: "", expiresAt: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = () => {
    fetch("/api/announcements?admin=true")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAnnouncements, []);

  const handleCreate = async () => {
    if (!form.titleEn || !form.descriptionEn) return;
    setSaving(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          publishAt: form.publishAt || null,
          expiresAt: form.expiresAt || null,
        }),
      });
      if (res.ok) {
        setForm({ titleEn: "", titleUr: "", descriptionEn: "", descriptionUr: "", status: "published", priority: 0, isPersistent: false, publishAt: "", expiresAt: "" });
        setShowForm(false);
        fetchAnnouncements();
      }
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    scheduled: "bg-blue-100 text-blue-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm">Manage public announcements</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0"
          style={{ background: "#146B3A" }}>
          <Plus size={16} />
          New Announcement
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Create Announcement</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title (English) *</label>
                <input type="text" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="Announcement title" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title (Urdu)</label>
                <input type="text" value={form.titleUr} onChange={(e) => setForm({ ...form, titleUr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="اعلان" dir="rtl" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description (English) *</label>
              <textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Urdu)</label>
              <textarea value={form.descriptionUr} onChange={(e) => setForm({ ...form, descriptionUr: e.target.value })}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none" dir="rtl" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Publish At</label>
                <input type="datetime-local" value={form.publishAt} onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expires At</label>
                <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="persistent" checked={form.isPersistent}
                onChange={(e) => setForm({ ...form, isPersistent: e.target.checked })} />
              <label htmlFor="persistent" className="text-sm text-gray-700">Persistent (always show)</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0" style={{ background: "#146B3A" }}>
              {saving ? "Creating..." : "Create Announcement"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm min-h-0">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Megaphone size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400">No announcements yet</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{ann.titleEn}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ann.status]}`}>
                      {ann.status}
                    </span>
                    {ann.isPersistent && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                        Persistent
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{ann.descriptionEn.slice(0, 150)}{ann.descriptionEn.length > 150 ? "..." : ""}</p>
                  <p className="text-xs text-gray-400 mt-2">Created {formatTimeAgo(ann.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
