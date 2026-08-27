import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import AIAssistant from "@/components/AIAssistant";
import AdPopup from "@/components/AdPopup";

export const metadata: Metadata = {
  title: "JKADB — Jammu Kashmir Awami Dast-o-Bazo",
  description: "جموں کشمیر عوامی دست و بازو — Public Complaint & Grievance Management Platform",
  keywords: ["JKADB", "Jammu Kashmir", "complaints", "grievance", "public service"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <AppProvider>{children}<AIAssistant /><AdPopup /></AppProvider>
      </body>
    </html>
  );
}
