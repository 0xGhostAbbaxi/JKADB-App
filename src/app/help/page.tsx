"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import CitizenNav from "@/components/CitizenNav";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FaqItem {
  id: string;
  questionEn: string;
  questionUr?: string | null;
  answerEn: string;
  answerUr?: string | null;
  category: string | null;
}

export default function HelpPage() {
  const { lang } = useApp();
  const isUrdu = lang === "ur";
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fontStyle = { fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif" };

  useEffect(() => {
    fetch("/api/faq")
      .then((r) => r.json())
      .then((d) => setFaq(d.faq || []))
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(faq.map((f) => f.category)));
  const categoryLabels: Record<string, { en: string; ur: string }> = {
    general: { en: "General", ur: "عمومی" },
    submission: { en: "Submitting Complaints", ur: "شکایت درج کرنا" },
    tracking: { en: "Tracking", ur: "ٹریکنگ" },
    resolution: { en: "Resolution", ur: "حل" },
    privacy: { en: "Privacy & Security", ur: "رازداری اور سیکیورٹی" },
  };

  return (
    <div className="min-h-screen bg-gray-50" style={fontStyle}>
      <CitizenNav currentPage="help" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
          <span>❓</span>
          {isUrdu ? "مدد اور سوالات" : "Help & FAQ"}
        </h1>
        <p className="text-gray-500 mb-8">
          {isUrdu ? "اکثر پوچھے جانے والے سوالات" : "Frequently asked questions about using JKADB"}
        </p>

        {loading ? (
          <div className="text-center py-12 text-gray-400">{isUrdu ? "لوڈ ہو رہا ہے..." : "Loading..."}</div>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat}>
                <h2
                  className="text-lg font-bold mb-4 pb-2 border-b-2"
                  style={{ color: "#146B3A", borderColor: "#146B3A" }}
                >
                  {cat ? (categoryLabels[cat]?.[lang] || cat) : (isUrdu ? "عمومی" : "General")}
                </h2>
                <div className="space-y-3">
                  {faq
                    .filter((f) => f.category === cat)
                    .map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <button
                          onClick={() => setOpen(open === item.id ? null : item.id)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors min-h-0"
                          dir={isUrdu ? "rtl" : "ltr"}
                        >
                          <span className="font-semibold text-gray-900 pr-4">
                            {isUrdu && item.questionUr ? item.questionUr : item.questionEn}
                          </span>
                          {open === item.id ? (
                            <ChevronUp size={18} className="text-gray-400 shrink-0" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-400 shrink-0" />
                          )}
                        </button>
                        {open === item.id && (
                          <div
                            className="px-5 pb-5 text-gray-600 text-sm border-t"
                            style={{ lineHeight: isUrdu ? "2.5" : "1.7" }}
                            dir={isUrdu ? "rtl" : "ltr"}
                          >
                            {isUrdu && item.answerUr ? item.answerUr : item.answerEn}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact section */}
        <div
          className="mt-10 p-6 rounded-2xl text-center"
          style={{ background: "linear-gradient(135deg, #146B3A, #0B4D2A)" }}
        >
          <p className="text-white font-semibold mb-2">
            {isUrdu ? "مزید مدد درکار ہے؟" : "Need more help?"}
          </p>
          <p className="text-red-200 text-sm mb-4">
            {isUrdu
              ? "اپنی شکایت درج کرنے کے لیے ہمارا فارم استعمال کریں"
              : "Use our complaint form to get assistance"}
          </p>
          <a
            href="/complaint/submit"
            className="inline-block px-6 py-2 bg-white font-bold rounded-xl text-sm"
            style={{ color: "#146B3A" }}
          >
            {isUrdu ? "شکایت درج کریں" : "Submit Complaint"}
          </a>
        </div>
      </div>
    </div>
  );
}
