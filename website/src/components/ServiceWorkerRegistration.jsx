"use client";

import { useEffect } from "react";

const runWhenIdle = (callback) => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 3000 });
    return;
  }

  window.setTimeout(callback, 1200);
};

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (cancelled) return;

        const controller = registration.active || registration.waiting || registration.installing;

        runWhenIdle(async () => {
          try {
            const response = await fetch("/api/v1/public/cache-version", { cache: "no-store" });
            const payload = await response.json();
            const version = payload?.version || payload?.data?.version;

            if (version && controller) {
              controller.postMessage({ type: "CACHE_VERSION", version });
            }

            controller?.postMessage({ type: "PRECACHE_PAGES" });
          } catch (error) {
            controller?.postMessage({ type: "PRECACHE_PAGES" });
          }
        });
      } catch (error) {
        // PWA registration must never block the page.
      }
    };

    register();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
