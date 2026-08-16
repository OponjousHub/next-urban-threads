"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "urban_threads_storefront_session";

export default function StorefrontSessionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    /*
     * Never track admin pages as storefront traffic.
     */
    if (pathname?.startsWith("/admin")) {
      return;
    }

    let sessionKey = sessionStorage.getItem(SESSION_KEY);

    if (!sessionKey) {
      sessionKey = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionKey);
    }

    const trackSession = async () => {
      try {
        await fetch("/api/storefront/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionKey,
          }),
          keepalive: true,
        });
      } catch (error) {
        console.error("Failed to track storefront session:", error);
      }
    };

    trackSession();
  }, [pathname]);

  return null;
}
