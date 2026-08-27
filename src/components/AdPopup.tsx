"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  ctaLabel: string | null;
}

export default function AdPopup() {
  const pathname = usePathname();
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    fetch("/api/advertisements/active")
      .then((r) => r.json())
      .then((d) => {
        const active: Advertisement | null = d.advertisement || null;
        if (!active) return;
        const dismissedKey = `jkadb_ad_dismissed_${active.id}`;
        if (sessionStorage.getItem(dismissedKey)) return;
        setAd(active);
        setVisible(true);
      })
      .catch(() => {});
  }, [pathname]);

  if (!visible || !ad || pathname?.startsWith("/admin")) return null;

  const dismiss = () => {
    sessionStorage.setItem(`jkadb_ad_dismissed_${ad.id}`, "1");
    setVisible(false);
  };

  const proceed = () => {
    if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
    dismiss();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white"
        >
          <X size={18} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.imageUrl} alt={ad.title} className="w-full max-h-72 object-cover" />
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">{ad.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={dismiss}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            {ad.linkUrl && (
              <button
                onClick={proceed}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
              >
                {ad.ctaLabel || "Proceed"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
