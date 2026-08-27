"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import SplashScreen from "@/components/SplashScreen";
import CitizenHome from "@/components/CitizenHome";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const { lang } = useApp();

  useEffect(() => {
    const seen = sessionStorage.getItem("jkadb_splash_seen");
    if (seen) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("jkadb_splash_seen", "1");
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <CitizenHome />;
}
