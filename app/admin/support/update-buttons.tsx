"use client";

import { useTransition } from "react";

export function UpdateButtons({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const updateStatus = (status: string) => {
    startTransition(async () => {
      await fetch("/api/admin/support/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      window.location.reload();
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus("READ")}
        disabled={isPending}
        className="text-xs bg-blue-500 text-white px-3 py-1 rounded"
      >
        Mark as Read
      </button>

      <button
        onClick={() => updateStatus("RESOLVED")}
        disabled={isPending}
        className="text-xs bg-green-500 text-white px-3 py-1 rounded"
      >
        Resolve
      </button>
    </div>
  );
}
