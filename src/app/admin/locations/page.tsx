"use client";

import { useEffect, useState } from "react";
import { Plus, MapPin } from "lucide-react";

interface LocationItem {
  id: string;
  nameEn: string;
  nameUr?: string | null;
  code?: string | null;
  isActive: boolean;
}

type LocationType = "districts" | "tehsils" | "union-councils" | "constituencies" | "areas";

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<LocationType>("districts");
  const [data, setData] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nameEn: "", nameUr: "", code: "", districtId: "", tehsilId: "", unionCouncilId: "", constituencyType: "LA",
  });
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [tehsils, setTehsils] = useState<LocationItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const typeMap: Record<LocationType, string> = {
    districts: "district",
    tehsils: "tehsil",
    "union-councils": "union_council",
    constituencies: "constituency",
    areas: "area",
  };

  const fetchData = (tab: LocationType) => {
    setLoading(true);
    fetch(`/api/admin/locations?type=${tab}`)
      .then((r) => r.json())
      .then((d) => setData(d.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(activeTab);
    fetch("/api/locations/districts").then((r) => r.json()).then((d) => setDistricts(d.districts || []));
  }, [activeTab]);

  const handleTabChange = (tab: LocationType) => {
    setActiveTab(tab);
    setShowForm(false);
    setError("");
  };

  const handleCreate = async () => {
    if (!form.nameEn.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeMap[activeTab],
          nameEn: form.nameEn,
          nameUr: form.nameUr || undefined,
          code: form.code || undefined,
          districtId: form.districtId || undefined,
          tehsilId: form.tehsilId || undefined,
          unionCouncilId: form.unionCouncilId || undefined,
          constituencyType: form.constituencyType,
        }),
      });
      if (res.ok) {
        setForm({ nameEn: "", nameUr: "", code: "", districtId: "", tehsilId: "", unionCouncilId: "", constituencyType: "LA" });
        setShowForm(false);
        fetchData(activeTab);
      } else {
        const d = await res.json();
        setError(d.error || "Failed to create");
      }
    } catch {
      setError("Error");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: LocationType; label: string }[] = [
    { key: "districts", label: "Districts" },
    { key: "tehsils", label: "Tehsils" },
    { key: "union-councils", label: "Union Councils" },
    { key: "constituencies", label: "Constituencies" },
    { key: "areas", label: "Areas" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Location Management</h1>
          <p className="text-gray-500 text-sm">Manage the location hierarchy</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0"
          style={{ background: "#146B3A" }}
        >
          <Plus size={16} />
          Add {tabs.find(t => t.key === activeTab)?.label.slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold min-h-0 ${
              activeTab === tab.key ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            style={activeTab === tab.key ? { background: "#146B3A" } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Add {tabs.find(t => t.key === activeTab)?.label.slice(0, -1)}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name (English) *</label>
              <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="English name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name (Urdu)</label>
              <input type="text" value={form.nameUr} onChange={(e) => setForm({ ...form, nameUr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="اردو نام" dir="rtl" />
            </div>
            {["constituencies"].includes(activeTab) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Code (e.g., LA-14)</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="LA-14" />
              </div>
            )}
            {["tehsils", "union-councils", "constituencies", "areas"].includes(activeTab) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">District</label>
                <select value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.nameEn}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0" style={{ background: "#146B3A" }}>
              {saving ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm min-h-0">Cancel</button>
          </div>
        </div>
      )}

      {/* LA-14 Bagh (1) note */}
      {activeTab === "constituencies" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
          📍 <strong>LA-14 Bagh (1)</strong> is already seeded in the system as required.
        </div>
      )}

      {/* Data list */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400">No {activeTab} found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Name (EN)</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Name (UR)</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Code</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{item.nameEn}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm" dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                    {item.nameUr || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{item.code || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
