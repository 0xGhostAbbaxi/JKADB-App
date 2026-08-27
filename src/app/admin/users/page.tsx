"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Shield } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  designation?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  departmentName?: string | null;
  districtName?: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: "", username: "", name: "", password: "", role: "complaint_officer", designation: "",
    departmentId: "", districtId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const handleCreate = async () => {
    if (!form.email || !form.username || !form.name || !form.password) {
      setError("Email, name and password are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("User created successfully");
        setShowForm(false);
        setForm({ email: "", username: "", name: "", password: "", role: "complaint_officer", designation: "", departmentId: "", districtId: "" });
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch {
      setError("Error creating user");
    } finally {
      setSaving(false);
    }
  };

  const roleColors: Record<string, string> = {
    super_admin: "bg-red-100 text-red-800",
    district_admin: "bg-purple-100 text-purple-800",
    reviewer: "bg-blue-100 text-blue-800",
    complaint_officer: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin Users</h1>
          <p className="text-gray-500 text-sm">{users.length} users in system</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0"
          style={{ background: "#146B3A" }}
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm">
          ✅ {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Create New Admin User</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username *</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="admin.username" autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                <option value="complaint_officer">Complaint Officer</option>
                <option value="reviewer">Reviewer</option>
                <option value="district_admin">District Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
              <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="e.g., Senior Officer" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0" style={{ background: "#146B3A" }}>
              {saving ? "Creating..." : "Create User"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm min-h-0">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">User</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Department</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: "#146B3A" }}>
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[user.role] || "bg-gray-100 text-gray-700"}`}>
                    {user.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{user.departmentName || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {user.lastLoginAt ? formatTimeAgo(user.lastLoginAt) : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
