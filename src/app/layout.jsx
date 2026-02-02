import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

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
        {children}
      </body>
    </html>
  );
}
