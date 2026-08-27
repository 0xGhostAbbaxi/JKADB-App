"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import CitizenNav from "./CitizenNav";
import { X, ChevronRight, TrendingUp } from "lucide-react";

interface Announcement {
  id: string;
  titleEn: string;
  titleUr?: string;
  descriptionEn: string;
  descriptionUr?: string;
  isPersistent?: boolean;
}

interface PublicStats {
  total: number;
  resolved: number;
  active: number;
  critical: number;
}

export default function CitizenHome() {
  const { lang, t } = useApp();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    // Fetch announcements
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => {
        if (data.announcements?.length > 0) {
          const dismissed = JSON.parse(sessionStorage.getItem("jkadb_dismissed_announcements") || "[]");
          const active = data.announcements.find(
            (a: Announcement) => a.isPersistent || !dismissed.includes(a.id)
          );
          if (active) setAnnouncement(active);
        }
      })
      .catch(() => {});

    // Fetch public stats
    fetch("/api/public/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats as PublicStats);
      })
      .catch(() => {});
  }, []);

  const dismissAnnouncement = (id: string) => {
    const dismissed = JSON.parse(sessionStorage.getItem("jkadb_dismissed_announcements") || "[]");
    dismissed.push(id);
    sessionStorage.setItem("jkadb_dismissed_announcements", JSON.stringify(dismissed));
    setAnnouncement(null);
  };

  const isUrdu = lang === "ur";

  return (
    <div className={`min-h-screen ${isUrdu ? "font-urdu" : ""}`} style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif" }}>
      <CitizenNav currentPage="home" />

      {/* Announcement Popup */}
      {announcement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            style={{ direction: isUrdu ? "rtl" : "ltr" }}
          >
            <button
              onClick={() => dismissAnnouncement(announcement.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 min-h-0"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📢</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                {isUrdu ? "اعلان" : "Announcement"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isUrdu ? announcement.titleUr || announcement.titleEn : announcement.titleEn}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {isUrdu ? announcement.descriptionUr || announcement.descriptionEn : announcement.descriptionEn}
            </p>
            <button
              onClick={() => dismissAnnouncement(announcement.id)}
              className="mt-4 w-full py-2 text-sm font-medium text-white rounded-lg min-h-0"
              style={{ background: "#146B3A" }}
            >
              {isUrdu ? "بند کریں" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0B4D2A 0%, #146B3A 40%, #1A5C2A 100%)",
          minHeight: "65vh",
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(212,160,23,0.2) 0%, transparent 40%)`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          {/* Chinar leaf large */}
          <div className="text-7xl mb-6 animate-fadeIn">🖐️</div>

          <h1
            className="font-black text-white mb-4 animate-fadeInUp"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif",
              lineHeight: isUrdu ? "2" : "1.2",
            }}
          >
            {t("heroTitle")}
          </h1>

          <p
            className="text-white/80 mb-8 animate-fadeInUp delay-200 max-w-2xl mx-auto"
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif",
              lineHeight: isUrdu ? "2.5" : "1.6",
            }}
          >
            {t("heroSubtitle")}
          </p>

          {/* Main CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp delay-400"
            style={{ direction: isUrdu ? "rtl" : "ltr" }}
          >
            <Link
              href="/complaint/submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg"
              style={{ color: "#146B3A", fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif" }}
            >
              <span>📝</span>
              {t("submitBtn")}
              <ChevronRight size={18} />
            </Link>

            <Link
              href="/complaint/track"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/70 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-lg"
              style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif" }}
            >
              <span>🔍</span>
              {t("trackBtn")}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: isUrdu ? "کل شکایات" : "Total Complaints", value: Number(stats.total || 0), icon: "📋", color: "#146B3A" },
                { label: isUrdu ? "حل شدہ" : "Resolved", value: Number(stats.resolved || 0), icon: "✅", color: "#1A5C2A" },
                { label: isUrdu ? "زیر کارروائی" : "Active", value: Number(stats.active || 0), icon: "⚡", color: "#D4A017" },
                { label: isUrdu ? "اہم شکایات" : "Critical", value: Number(stats.critical || 0), icon: "🚨", color: "#DC2626" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-gray-50">
                  <div className="text-3xl mb-1">{stat.icon}</div>
                  <div
                    className="text-3xl font-black"
                    style={{ color: stat.color, fontFamily: "Inter, sans-serif" }}
                  >
                    {stat.value.toLocaleString()}
                  </div>
                  <div
                    className="text-sm text-gray-600 mt-1"
                    style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main actions grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: t("submitComplaint"),
              titleUr: "شکایت درج کریں",
              desc: isUrdu
                ? "اپنی شکایت آسانی سے درج کروائیں"
                : "Submit your complaint quickly and easily",
              icon: "📝",
              href: "/complaint/submit",
              color: "#146B3A",
              bg: "#FFF5F5",
            },
            {
              title: t("trackComplaint"),
              titleUr: "شکایت ٹریک کریں",
              desc: isUrdu
                ? "اپنی شکایت کی موجودہ حالت جانیں"
                : "Check the status of your complaint",
              icon: "🔍",
              href: "/complaint/track",
              color: "#1A5C2A",
              bg: "#F0FDF4",
            },
            {
              title: t("announcements"),
              titleUr: "اعلانات",
              desc: isUrdu
                ? "سرکاری اعلانات اور خبریں دیکھیں"
                : "View official announcements and news",
              icon: "📢",
              href: "/announcements",
              color: "#92400E",
              bg: "#FFFBEB",
            },
            {
              title: t("help"),
              titleUr: "مدد اور سوالات",
              desc: isUrdu
                ? "اکثر پوچھے جانے والے سوالات"
                : "Frequently asked questions and guides",
              icon: "❓",
              href: "/help",
              color: "#1E40AF",
              bg: "#EFF6FF",
            },
            {
              title: t("about"),
              titleUr: "ہمارے بارے میں",
              desc: isUrdu
                ? "JKADB کے بارے میں مزید جانیں"
                : "Learn more about JKADB platform",
              icon: "ℹ️",
              href: "/about",
              color: "#5B21B6",
              bg: "#F5F3FF",
            },

          ].map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="block p-6 rounded-2xl border-2 hover:shadow-lg transition-all hover:-translate-y-1 group complaint-card"
              style={{
                backgroundColor: card.bg,
                borderColor: `${card.color}22`,
              }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{
                  color: card.color,
                  fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif",
                  lineHeight: isUrdu ? "2" : "1.3",
                }}
              >
                {isUrdu ? card.titleUr || card.title : card.title}
              </h3>
              <p
                className="text-gray-600 text-sm"
                style={{
                  fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif",
                  lineHeight: isUrdu ? "2.2" : "1.5",
                }}
              >
                {card.desc}
              </p>
              <div
                className="mt-4 flex items-center gap-1 text-sm font-semibold"
                style={{ color: card.color }}
              >
                {isUrdu ? "مزید →" : "Get started →"}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-8 text-center text-sm"
        style={{
          background: "linear-gradient(135deg, #0B4D2A 0%, #146B3A 100%)",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span>🖐️</span>
            <span className="font-bold text-white" style={{ fontFamily: "Inter, sans-serif" }}>JKADB</span>
            <span>🖐️</span>
          </div>
          <p style={{ fontFamily: "Inter, sans-serif" }}>
            From: <strong className="text-yellow-300">MAJOR FORCE Narakot</strong> | Built by:{" "}
            <strong className="text-yellow-300">Hozafa Mehmood</strong>
          </p>
          <p
            className="mt-1"
            style={{ fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2" }}
          >
            جموں کشمیر عوامی دست و بازو
          </p>
          <p className="mt-2 text-xs opacity-60" style={{ fontFamily: "Inter, sans-serif" }}>
            © {new Date().getFullYear()} JKADB. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
