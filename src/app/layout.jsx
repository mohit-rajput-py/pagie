import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Root Layout for Pagie
 * Loads Google Fonts and wraps the app
 */
export const metadata = {
  title: "Pagie — Distraction-free Markdown Editor",
  description: "A beautiful, minimalist markdown editor.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        <Analytics />
        <SpeedInsights />
        {children}
      </body>
    </html>
  );
}
