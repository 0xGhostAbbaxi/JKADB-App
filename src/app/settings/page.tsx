"use client";

import Link from "next/link";
import { Settings, Shield, Globe, Sun, Moon, ArrowLeft } from "lucide-react";
import CitizenNav from "@/components/CitizenNav";
import { useApp } from "@/contexts/AppContext";

export default function SettingsPage() {
  const { lang, setLang, isDark, setTheme } = useApp();
  return (
    <div className="min-h-screen bg-slate-50">
      <CitizenNav currentPage="settings" />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-jkadb-green-dark">
            <ArrowLeft size={16} /> {lang === "ur" ? "واپس" : "Back"}
          </Link>
          <div className="mt-5 flex items-center gap-3">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800"><Settings /></div>
            <div>
              <h1 className="text-3xl font-black">{lang === "ur" ? "ترتیبات" : "Settings"}</h1>
              <p className="text-slate-500">{lang === "ur" ? "زبان، تھیم اور منتظم رسائی" : "Language, theme and administrator access"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold">{lang === "ur" ? "زبان" : "Language"}</h2>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setLang("en")} className={`rounded-xl px-4 py-3 ${lang === "en" ? "bg-green-700 text-white" : "bg-slate-100"}`}>English</button>
              <button onClick={() => setLang("ur")} className={`rounded-xl px-4 py-3 ${lang === "ur" ? "bg-green-700 text-white" : "bg-slate-100"}`}>اردو</button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold">{lang === "ur" ? "تھیم" : "Theme"}</h2>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setTheme("light")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 ${!isDark ? "bg-green-700 text-white" : "bg-slate-100"}`}><Sun size={17}/>Light</button>
              <button onClick={() => setTheme("dark")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 ${isDark ? "bg-green-700 text-white" : "bg-slate-100"}`}><Moon size={17}/>Dark</button>
            </div>
          </section>

          <section className="md:col-span-2 rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <Shield className="mt-1 text-green-800" />
              <div className="flex-1">
                <h2 className="font-bold text-green-950">{lang === "ur" ? "منتظم رسائی" : "Administrator Access"}</h2>
                <p className="mt-1 text-sm text-green-900/70">
                  {lang === "ur" ? "ایڈمن لاگ اِن مرکزی صفحے پر ظاہر نہیں کیا جاتا۔ محفوظ رسائی کے لیے یہاں سے جائیں۔" : "Administrator login is intentionally kept out of the public homepage."}
                </p>
                <Link href="/admin" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 font-bold text-white hover:bg-green-900">
                  <Shield size={17} /> Admin Login
                </Link>
              </div>
            </div>
          </section>

          <section className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Globe className="text-green-700" />
              <div>
                <h2 className="font-bold">JKADB</h2>
                <p className="text-sm text-slate-500">From: MAJOR FORCE Narakot · Built by: Hozafa Mehmood</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
