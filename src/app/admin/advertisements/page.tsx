"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/admin/ui";
import { Megaphone, Trash2, Upload, Loader2 } from "lucide-react";

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  ctaLabel: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/advertisements")
      .then((r) => r.json())
      .then((d) => setAds(d.advertisements || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleCreate = async () => {
    setError("");
    if (!title.trim() || !file) {
      setError("Title aur image dono zaroori hain.");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("linkUrl", linkUrl.trim());
      form.append("ctaLabel", ctaLabel.trim());
      form.append("isActive", "true");
      form.append("image", file);
      const res = await fetch("/api/admin/advertisements", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ad create nahi ho saka.");
        return;
      }
      setTitle("");
      setLinkUrl("");
      setCtaLabel("");
      handleFile(null);
      load();
    } catch {
      setError("Connection error.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: Advertisement) => {
    await fetch(`/api/admin/advertisements/${ad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ad.isActive }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Ye advertisement delete karni hai?")) return;
    await fetch(`/api/admin/advertisements/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Megaphone className="text-emerald-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advertisement Broadcast</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Sirf ek dafa mein ek advertisement "active" honi chahiye — jo active hai wahi citizens ko popup mein dikhegi.
      </p>

      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Nayi Advertisement Banao</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ad ka title"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600"
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Link (optional) — jahan 'Proceed' pe click karke jayega"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600"
            />
            <input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Button ka text (optional, default: Proceed)"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600"
            />
            <label className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:border-emerald-600">
              <Upload size={16} />
              {file ? file.name : "Image chuno (JPG/PNG/WEBP, max 5MB)"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Ban raha hai..." : "Advertisement Publish Karo"}
            </button>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 min-h-[180px]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="max-h-56 object-contain" />
            ) : (
              <span className="text-sm text-gray-400">Image preview yahan aayegi</span>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Saari Advertisements</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Load ho raha hai...</p>
        ) : ads.length === 0 ? (
          <p className="text-sm text-gray-400">Abhi tak koi advertisement nahi bani.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover" />
                <div className="p-3 space-y-2">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{ad.title}</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        ad.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {ad.isActive ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => remove(ad.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
