"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { captureInstallPrompt } from "./install-state";

/** Registers the service worker (production only) and listens for install events. */
export function PwaSetup() {
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    const installed = () => track("app_installed");
    window.addEventListener("appinstalled", installed);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(`/sw.js?v=${process.env.TROPINA_BUILD_ID}`)
        .then(() => navigator.serviceWorker.ready)
        .then(() => {
          // Install finishes only after every card is saved; tests wait for this.
          (window as { __tropinaPrecached?: boolean }).__tropinaPrecached = true;
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  return null;
}
