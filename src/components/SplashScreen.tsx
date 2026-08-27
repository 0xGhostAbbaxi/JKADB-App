"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps { onComplete: () => void; }

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 180),
      setTimeout(() => setPhase(2), 650),
      setTimeout(() => setPhase(3), 1150),
      setTimeout(() => setPhase(4), 1650),
      setTimeout(() => onComplete(), 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0B4D2A] text-white">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_20%,white,transparent_35%)]" />
      <div className="relative z-10 flex max-w-xl flex-col items-center px-6 text-center">
        <div
          className="mb-4 text-8xl"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "scale(1)" : "scale(.35)",
            transition: "all .55s cubic-bezier(.2,.8,.2,1)",
          }}
          aria-label="Open hand"
        >
          🖐️
        </div>
        <div style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity .45s ease" }}>
          <h1 className="text-6xl font-black tracking-[.18em]">JKADB</h1>
          <p className="mt-3 text-sm font-medium tracking-wide text-white/85">
            Jammu Kashmir Awami Dast-o-Bazo
          </p>
          <p className="mt-1 text-lg text-white/90" dir="rtl">
            جموں کشمیر عوامی دست و بازو
          </p>
        </div>
        <div
          className="mt-8 h-px w-64 bg-white/30"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity .4s ease" }}
        />
        <div
          className="mt-6 space-y-1 text-xs uppercase tracking-[.16em] text-white/70"
          style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity .4s ease" }}
        >
          <p>From: MAJOR FORCE Narakot</p>
          <p>Built by: Hozafa Mehmood</p>
        </div>
      </div>
    </div>
  );
}
