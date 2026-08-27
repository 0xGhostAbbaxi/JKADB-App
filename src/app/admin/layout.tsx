"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Users, Building2, Tag, MapPin, BarChart3,
  FileBarChart, ScrollText, Settings, Bell, Megaphone, LogOut, Menu, X,
  Clock, AlertTriangle, UserCheck, List, ChevronDown, ChevronRight,
  Shield, Database, ArrowUpCircle, CheckSquare, MessageSquare, Search
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const navSections = [
  { title: "Overview", items: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/complaints", label: "Requests", icon: FileText },
    { href: "/admin/conversations", label: "Conversations", icon: MessageSquare },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
  ]},
  { title: "Operations", items: [
    { href: "/admin/complaints?isRead=false", label: "Unread", icon: Bell },
    { href: "/admin/complaints?status=submitted", label: "Unanswered", icon: MessageSquare },
    { href: "/admin/complaints?priority=critical", label: "Critical", icon: AlertTriangle },
    { href: "/admin/assignments", label: "Assignments", icon: UserCheck },
    { href: "/admin/sla", label: "SLA & Escalations", icon: Clock },
    { href: "/admin/escalations", label: "Escalations", icon: ArrowUpCircle },
  ]},
  { title: "Organization", items: [
    { href: "/admin/departments", label: "Departments", icon: Building2 },
    { href: "/admin/officers", label: "Officers", icon: Users },
    { href: "/admin/categories", label: "Categories", icon: Tag },
    { href: "/admin/locations", label: "Locations", icon: MapPin },
  ]},
  { title: "Communication", items: [
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/advertisements", label: "Advertisements", icon: Megaphone },
    { href: "/admin/quick-alerts", label: "Quick Alerts", icon: AlertTriangle },
    { href: "/admin/contact", label: "Public Contact", icon: Bell },
    { href: "/admin/faq", label: "FAQ", icon: MessageSquare },
    { href: "/admin/templates", label: "Response Templates", icon: FileText },
  ]},
  { title: "Insights", items: [
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/reports", label: "Reports", icon: FileBarChart },
  ]},
  { title: "Management & Security", items: [
    { href: "/admin/users", label: "Administrators", icon: Users },
    { href: "/admin/roles", label: "Roles & Permissions", icon: Shield },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
    { href: "/admin/ai", label: "AI Monitoring", icon: Database },
    { href: "/admin/system-health", label: "System Health", icon: Shield },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
    { href: "/admin/profile", label: "Admin Profile", icon: UserCheck },
  ]},
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Skip auth check on login page
  const isLoginPage = pathname === "/admin" || pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    fetch("/api/admin/me")
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error("Unauthorized");
      })
      .then((data) => setUser(data.user))
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">🖐️</div>
          <div className="text-sm opacity-60">Loading JKADB Admin...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleColors: Record<string, string> = {
    super_admin: "bg-red-100 text-red-800",
    district_admin: "bg-purple-100 text-purple-800",
    reviewer: "bg-blue-100 text-blue-800",
    complaint_officer: "bg-green-100 text-green-800",
  };

  const Sidebar = () => (
    <div
      className="h-full flex flex-col admin-sidebar overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #07351D 0%, #0B4D2A 55%, #0A3F24 100%)" }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖐️</span>
          <div>
            <div className="font-black text-white text-base" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.05em" }}>
              JKADB
            </div>
            <div className="text-xs text-green-200 opacity-70" style={{ fontFamily: "Inter, sans-serif" }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
            style={{ background: "#146B3A" }}
          >
            {user.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[user.role] || "bg-gray-100 text-gray-800"}`}>
              {user.role.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6 py-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2 px-2">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-0 ${
                      isActive
                        ? "bg-white/10 text-white border border-white/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-xl text-sm font-medium transition-all min-h-0"
        >
          <LogOut size={16} />
          Logout
        </button>
        <a
          href="/"
          className="mt-1 w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:bg-white/5 rounded-xl text-sm transition-all min-h-0"
        >
          ← Citizen Portal
        </a>
        <p className="text-center text-white/20 text-xs mt-3" style={{ fontFamily: "Inter, sans-serif" }}>
          Built by Hozafa Mehmood
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 shrink-0 flex-col h-screen">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 h-full flex flex-col">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b shadow-sm px-4 h-14 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 min-h-0"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-500 lg:hidden">
              🖐️ JKADB Admin
            </p>
          </div>

          <Link
            href="/admin/complaints?isRead=false"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium min-h-0"
          >
            <Bell size={16} />
            <span className="hidden sm:inline">Alerts</span>
          </Link>

          <div className="text-sm text-gray-500 hidden sm:block">
            👋 {user.name.split(" ")[0]}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
