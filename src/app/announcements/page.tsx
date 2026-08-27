"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import CitizenNav from "@/components/CitizenNav";

interface Announcement {
  id: string;
  titleEn: string;
  titleUr?: string | null;
  descriptionEn: string;
  descriptionUr?: string | null;
  bannerUrl?: string | null;
  priority?: number | null;
  publishAt?: string | null;
  expiresAt?: string | null;
}

export default function AnnouncementsPage() {
  const { lang } = useApp();
  const isUrdu = lang === "ur";
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fontStyle = { fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif" };

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" style={fontStyle}>
      <CitizenNav currentPage="announcements" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <span>📢</span>
          {isUrdu ? "سرکاری اعلانات" : "Announcements"}
        </h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400">{isUrdu ? "لوڈ ہو رہا ہے..." : "Loading..."}</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <span className="text-5xl">📭</span>
            <p className="text-gray-500 mt-4">{isUrdu ? "ابھی کوئی اعلان نہیں" : "No announcements at this time"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-2xl shadow-sm p-6 border-l-4" style={{ borderColor: "#146B3A" }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📢</span>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {isUrdu && ann.titleUr ? ann.titleUr : ann.titleEn}
                    </h2>
                    <p className="text-gray-600 leading-relaxed" style={{ lineHeight: isUrdu ? "2.2" : "1.6" }}>
                      {isUrdu && ann.descriptionUr ? ann.descriptionUr : ann.descriptionEn}
                    </p>
                    {ann.publishAt && (
                      <p className="text-xs text-gray-400 mt-3">
                        {new Date(ann.publishAt).toLocaleDateString(isUrdu ? "ur-PK" : "en-PK")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
