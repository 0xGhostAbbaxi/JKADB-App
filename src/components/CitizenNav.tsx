"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Menu, X, Globe, Sun, Moon, Settings, Bell } from "lucide-react";
import Link from "next/link";

interface CitizenNavProps {
  currentPage?: string;
}

export default function CitizenNav({ currentPage }: CitizenNavProps) {
  const { lang, setLang, theme, setTheme, isDark, t } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems = [
    { key: "home", label: t("home"), href: "/", icon: "🏠" },
    { key: "submit", label: t("submitComplaint"), href: "/complaint/submit", icon: "📝" },
    { key: "track", label: t("trackComplaint"), href: "/complaint/track", icon: "🔍" },
    { key: "announcements", label: t("announcements"), href: "/announcements", icon: "📢" },
    { key: "help", label: t("help"), href: "/help", icon: "❓" },
    { key: "about", label: t("about"), href: "/about", icon: "ℹ️" },
  ];

  return (
    <nav
      className="sticky top-0 z-40 shadow-lg"
      style={{
        background: "linear-gradient(135deg, #146B3A 0%, #0F5A30 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🖐️</span>
            <div>
              <div className="font-black text-white text-lg leading-none tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>
                JKADB
              </div>
              <div
                className="text-xs hidden sm:block"
                style={{
                  color: "rgba(212, 160, 23, 0.9)",
                  fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif",
                  lineHeight: lang === "ur" ? "1.8" : "1.2",
                }}
              >
                {lang === "ur" ? "جموں کشمیر عوامی دست و بازو" : "Jammu Kashmir Awami Dast-o-Bazo"}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-0 ${
                  currentPage === item.key
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium min-h-0"
              title="Switch Language / زبان تبدیل کریں"
            >
              <Globe size={14} />
              <span>{lang === "en" ? "اردو" : "EN"}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white min-h-0"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              href="/settings"
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs min-h-0"
              aria-label="Settings"
            >
              <Settings size={15} />
              <span>Settings</span>
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 text-white min-h-0"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/20">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg mx-2 mb-1 ${
                  currentPage === item.key
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                style={{
                  fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif",
                  direction: lang === "ur" ? "rtl" : "ltr",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg mx-2 text-white/90 hover:bg-white/10"
            >
              <Settings size={17} />
              <span>Settings</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
