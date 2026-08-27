"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

interface Officer {
  id: string;
  name: string;
  email: string;
  role: string;
  designation?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  departmentName?: string | null;
  districtName?: string | null;
}

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setOfficers((d.users || []).filter((u: Officer) => ["complaint_officer", "reviewer"].includes(u.role))))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Officers</h1>
          <p className="text-gray-500 text-sm">{officers.length} officers</p>
        </div>
        <Link href="/admin/users"
          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold min-h-0"
          style={{ background: "#146B3A" }}>
          Manage Users
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-400">Loading...</div>
        ) : officers.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl p-12 text-center">
            <Users size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400">No officers yet. <Link href="/admin/users" className="text-red-800 hover:underline">Add users</Link></p>
          </div>
        ) : officers.map((officer) => (
          <div key={officer.id} className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-black"
                style={{ background: "#146B3A" }}>
                {officer.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{officer.name}</h3>
                <p className="text-xs text-gray-400">{officer.email}</p>
                {officer.designation && <p className="text-xs text-gray-500 mt-0.5">{officer.designation}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${officer.role === "reviewer" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                {officer.role.replace("_", " ")}
              </span>
              {officer.departmentName && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {officer.departmentName}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${officer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {officer.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Last login: {officer.lastLoginAt ? formatTimeAgo(officer.lastLoginAt) : "Never"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
