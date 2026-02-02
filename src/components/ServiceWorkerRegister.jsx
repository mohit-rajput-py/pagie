"use client";

import { useEffect } from "react";

/**
 * Registers the Service Worker for offline support.
 * Only runs in the browser.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.protocol === "https:" // Only works on HTTPS (and localhost)
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    } else if (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        window.location.hostname === "localhost"
      ) {
        // Allow localhost testing
        navigator.serviceWorker.register("/sw.js");
      }
  }, []);

  return null;
}
