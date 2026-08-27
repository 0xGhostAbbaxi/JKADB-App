"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Language } from "@/lib/i18n";

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  isDark: boolean;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("light");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("jkadb_lang") as Language | null;
    const savedTheme = localStorage.getItem("jkadb_theme") as "light" | "dark" | "system" | null;
    if (savedLang) setLangState(savedLang);
    if (savedTheme) setThemeState(savedTheme);
  }, []);

  useEffect(() => {
    const computeIsDark = () => {
      if (theme === "dark") return true;
      if (theme === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };
    setIsDark(computeIsDark());
    document.documentElement.classList.toggle("dark", computeIsDark());
  }, [theme]);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("jkadb_lang", l);
    document.documentElement.setAttribute("lang", l);
    document.documentElement.setAttribute("dir", l === "ur" ? "rtl" : "ltr");
  };

  const setTheme = (t: "light" | "dark" | "system") => {
    setThemeState(t);
    localStorage.setItem("jkadb_theme", t);
  };

  const dir = lang === "ur" ? "rtl" : "ltr";

  const tFunc = (key: string): string => {
    // Import translations inline to avoid circular deps
    const { translations } = require("@/lib/i18n");
    return translations[lang]?.[key] || translations.en?.[key] || key;
  };

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, isDark, dir, t: tFunc }}>
      <div dir={dir} lang={lang} className={isDark ? "dark" : ""}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
