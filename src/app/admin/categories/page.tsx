"use client";

import { useEffect, useState } from "react";
import { Plus, Tag } from "lucide-react";

interface Category {
  id: string;
  nameEn: string;
  nameUr?: string | null;
  icon?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
  subcategories: Array<{ id: string; nameEn: string; isActive: boolean }>;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nameEn: "", nameUr: "", icon: "" });
  const [saving, setSaving] = useState(false);

  const fetchCats = () => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCats, []);

  const handleCreate = async () => {
    if (!form.nameEn) return;
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ nameEn: "", nameUr: "", icon: "" });
        setShowForm(false);
        fetchCats();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories configured</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0"
          style={{ background: "#146B3A" }}>
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">New Category</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name (English) *</label>
              <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name (Urdu)</label>
              <input type="text" value={form.nameUr} onChange={(e) => setForm({ ...form, nameUr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Icon (emoji)</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="🏗️" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0" style={{ background: "#146B3A" }}>
              {saving ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm min-h-0">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-400">Loading...</div>
        ) : categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{cat.icon}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {cat.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <h3 className="font-bold text-gray-900">{cat.nameEn}</h3>
            {cat.nameUr && <p className="text-sm text-gray-500 mt-0.5" dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>{cat.nameUr}</p>}
            <div className="mt-3">
              <p className="text-xs text-gray-400">{cat.subcategories?.length || 0} subcategories</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {cat.subcategories?.slice(0, 3).map((s) => (
                  <span key={s.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {s.nameEn}
                  </span>
                ))}
                {(cat.subcategories?.length || 0) > 3 && (
                  <span className="text-xs text-gray-400">+{(cat.subcategories?.length || 0) - 3} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
