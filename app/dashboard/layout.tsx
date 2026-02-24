"use client";

import { ReactNode, useEffect } from "react";

export default function OrderLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/sessions/touch", { method: "POST" });
    }, 60000); // every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
