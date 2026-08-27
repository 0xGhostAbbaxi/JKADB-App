"use client";

import { useApp } from "@/contexts/AppContext";
import CitizenNav from "@/components/CitizenNav";

export default function AboutPage() {
  const { lang } = useApp();
  const isUrdu = lang === "ur";
  const fontStyle = { fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif" };

  return (
    <div className="min-h-screen bg-gray-50" style={fontStyle}>
      <CitizenNav currentPage="about" />

      {/* Hero */}
      <div
        className="py-16 text-center"
        style={{ background: "linear-gradient(135deg, #0B4D2A 0%, #146B3A 40%, #1A5C2A 100%)" }}
      >
        <div className="text-7xl mb-4">🖐️</div>
        <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
          JKADB
        </h1>
        <p className="text-2xl font-semibold text-white/90 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
          Jammu Kashmir Awami Dast-o-Bazo
        </p>
        <p className="text-xl" style={{ color: "rgba(212,160,23,0.9)", fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2.5" }}>
          جموں کشمیر عوامی دست و بازو
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px w-24 bg-white/30" />
          <span style={{ color: "rgba(212,160,23,0.8)" }}>🖐️</span>
          <div className="h-px w-24 bg-white/30" />
        </div>
        <div className="mt-4 text-white/70 space-y-1 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
          <p>From: <strong className="text-yellow-300">MAJOR FORCE Narakot</strong></p>
          <p>Built by: <strong className="text-yellow-300">Hozafa Mehmood</strong></p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Mission */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2" style={{ color: "#146B3A" }}>
            <span>🎯</span>
            {isUrdu ? "ہمارا مقصد" : "Our Mission"}
          </h2>
          <p
            className="text-gray-700 leading-relaxed"
            style={{ lineHeight: isUrdu ? "2.5" : "1.8" }}
            dir={isUrdu ? "rtl" : "ltr"}
          >
            {isUrdu
              ? "JKADB (جموں کشمیر عوامی دست و بازو) جموں کشمیر کے شہریوں اور سرکاری محکموں کے درمیان ایک پیشہ ورانہ پل کا کام کرتا ہے۔ ہمارا مقصد ہر شہری کی آواز کو متعلقہ اداروں تک پہنچانا اور بروقت جواب یقینی بنانا ہے۔"
              : "JKADB (Jammu Kashmir Awami Dast-o-Bazo) serves as a professional bridge between citizens of Jammu Kashmir and government departments. Our mission is to ensure every citizen's voice reaches the relevant authority and receives a timely, accountable response."}
          </p>
        </div>

        {/* What we do */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2" style={{ color: "#146B3A" }}>
            <span>⚡</span>
            {isUrdu ? "ہم کیا کرتے ہیں" : "What We Do"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" dir={isUrdu ? "rtl" : "ltr"}>
            {[
              { icon: "📝", en: "Accept public complaints without mandatory registration", ur: "لازمی رجسٹریشن کے بغیر عوامی شکایات قبول کریں" },
              { icon: "🔍", en: "Provide secure, real-time complaint tracking", ur: "محفوظ، حقیقی وقت کی شکایت ٹریکنگ فراہم کریں" },
              { icon: "⚡", en: "Route complaints to the right department", ur: "شکایات کو صحیح محکمے تک پہنچائیں" },
              { icon: "⏱️", en: "Enforce SLA deadlines for timely resolution", ur: "بروقت حل کے لیے SLA ڈیڈ لائن نافذ کریں" },
              { icon: "🔐", en: "Protect citizen data and CNIC privacy", ur: "شہری ڈیٹا اور شناختی کارڈ کی رازداری کی حفاظت کریں" },
              { icon: "📊", en: "Provide transparent public statistics", ur: "شفاف عوامی اعداد و شمار فراہم کریں" },
              { icon: "🌐", en: "Support both English and Urdu", ur: "انگریزی اور اردو دونوں کی حمایت کریں" },
              { icon: "📱", en: "Work on mobile and desktop devices", ur: "موبائل اور ڈیسک ٹاپ آلات پر کام کریں" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-xl shrink-0">{item.icon}</span>
                <span className="text-gray-700 text-sm" style={{ lineHeight: isUrdu ? "2.2" : "1.5" }}>
                  {isUrdu ? item.ur : item.en}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div
          className="rounded-3xl p-8 mb-6 text-white"
          style={{ background: "linear-gradient(135deg, #146B3A, #0B4D2A)" }}
        >
          <h2 className="text-2xl font-black mb-6">
            {isUrdu ? "ہمارے اصول" : "Our Values"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: "⚖️", en: "Accountability", ur: "جوابدہی" },
              { icon: "🔍", en: "Transparency", ur: "شفافیت" },
              { icon: "🤝", en: "Accessibility", ur: "قابل رسائی" },
              { icon: "🔐", en: "Security", ur: "سیکیورٹی" },
              { icon: "⚡", en: "Efficiency", ur: "کارکردگی" },
              { icon: "💚", en: "Public Service", ur: "عوامی خدمت" },
            ].map((v, i) => (
              <div key={i} className="text-center p-3">
                <div className="text-3xl mb-2">{v.icon}</div>
                <div className="font-semibold text-sm" style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif" }}>
                  {isUrdu ? v.ur : v.en}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit */}
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🖐️</div>
          <p className="text-gray-500 text-sm mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
            A Public Service Initiative
          </p>
          <div className="space-y-2" style={{ fontFamily: "Inter, sans-serif" }}>
            <p className="text-lg font-black" style={{ color: "#146B3A" }}>JKADB</p>
            <p className="text-gray-600 font-semibold">Jammu Kashmir Awami Dast-o-Bazo</p>
            <p style={{ fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2.5", color: "#146B3A" }}>
              جموں کشمیر عوامی دست و بازو
            </p>
            <div className="pt-4 border-t mt-4">
              <p className="text-gray-500 text-sm">
                From: <strong style={{ color: "#146B3A" }}>MAJOR FORCE Narakot</strong>
              </p>
              <p className="text-gray-500 text-sm">
                Built by: <strong style={{ color: "#146B3A" }}>Hozafa Mehmood</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
