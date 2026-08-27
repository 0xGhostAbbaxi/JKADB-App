"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [devLoading, setDevLoading] = useState(false);
  const isDev = process.env.NODE_ENV !== "production";

  const handleDevLogin = async () => {
    setDevLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dev-login", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        window.location.replace("/admin/dashboard");
      } else {
        setError(data.error || "Direct login failed");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setDevLoading(false);
    }
  };

  useEffect(() => {
    // Check if already logged in
    fetch("/api/admin/me")
      .then((r) => {
        if (r.ok) window.location.replace("/admin/dashboard");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.toLowerCase().trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.replace("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0B4D2A, #146B3A)" }}>
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0B4D2A 0%, #146B3A 40%, #2D8A55 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 filter" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
            🖐️
          </div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>
            JKADB
          </h1>
          <p className="text-white/70 text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
            Admin Control Panel
          </p>
          <p style={{ fontFamily: "'Noto Nastaliq Urdu', serif", color: "rgba(212,160,23,0.8)", lineHeight: "2", fontSize: "0.9rem" }}>
            منتظم پینل
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-black text-gray-900 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            🔐 Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                placeholder="admin@example.com"
                autoComplete="username"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100 pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 min-h-0 p-1"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #146B3A, #0B4D2A)" }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "🔐"}
              {loading ? "Logging in..." : "Login to Admin Panel"}
            </button>
          </form>

          {isDev && (
            <div className="mt-6 pt-6 border-t border-dashed border-amber-300">
              <button
                type="button"
                onClick={handleDevLogin}
                disabled={devLoading}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-amber-50 text-amber-800 border-2 border-amber-300 hover:bg-amber-100 transition-colors disabled:opacity-60"
              >
                {devLoading ? <Loader2 size={16} className="animate-spin" /> : "⚡"}
                {devLoading ? "Logging in..." : "Direct Login (Dev/Test Only)"}
              </button>
              <p className="text-center text-amber-700/70 text-xs mt-2">
                Skips password. Only works outside production — remove before launch.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-gray-600">
              ← Back to Citizen Portal
            </a>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6" style={{ fontFamily: "Inter, sans-serif" }}>
          From: MAJOR FORCE Narakot | Built by: Hozafa Mehmood
        </p>
      </div>
    </div>
  );
}

export default AdminLoginPage;

