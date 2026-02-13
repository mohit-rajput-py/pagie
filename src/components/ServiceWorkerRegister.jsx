"use client";

import { useEffect } from "react";

/**
 * Registers the Service Worker for offline support.
 * Only runs in the browser.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // 1. Unregister all service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.log("Service Worker unregistered");
        }
      });

      // 2. Clear all caches
      if ("caches" in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
            console.log("Cache deleted:", name);
          }
        });
      }
    }
  }, []);

  return null;
}
