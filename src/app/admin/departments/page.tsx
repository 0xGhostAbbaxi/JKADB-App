"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Building2 } from "lucide-react";

interface Department {
  id: string;
  nameEn: string;
  nameUr?: string | null;
  description?: string | null;
  slaHours?: number | null;
  isActive: boolean;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nameEn: "", nameUr: "", description: "", slaHours: 72 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchDepts = () => {
    fetch("/api/admin/departments")
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchDepts, []);

  const handleCreate = async () => {
    if (!form.nameEn.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ nameEn: "", nameUr: "", description: "", slaHours: 72 });
        setShowForm(false);
        fetchDepts();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to create");
      }
    } catch {
      setError("Error creating department");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Departments</h1>
          <p className="text-gray-500 text-sm">{departments.length} departments configured</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0"
          style={{ background: "#146B3A" }}
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">New Department</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name (English) *</label>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                placeholder="e.g., Roads Department"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name (Urdu)</label>
              <input
                type="text"
                value={form.nameUr}
                onChange={(e) => setForm({ ...form, nameUr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                placeholder="محکمہ"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">SLA Hours</label>
              <input
                type="number"
                value={form.slaHours}
                onChange={(e) => setForm({ ...form, slaHours: parseInt(e.target.value) || 72 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                placeholder="Optional description"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0"
              style={{ background: "#146B3A" }}
            >
              {saving ? "Creating..." : "Create Department"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm min-h-0">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-400">Loading...</div>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF5F5" }}>
                  <Building2 size={20} style={{ color: "#146B3A" }} />
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    dept.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {dept.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="font-bold text-gray-900">{dept.nameEn}</h3>
              {dept.nameUr && <p className="text-sm text-gray-500 mt-0.5" dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>{dept.nameUr}</p>}
              {dept.description && <p className="text-sm text-gray-500 mt-1">{dept.description}</p>}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  SLA: {dept.slaHours}h
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
