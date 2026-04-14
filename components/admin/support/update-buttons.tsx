"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function UpdateButtons({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const updateStatus = (status: string) => {
    startTransition(async () => {
      await fetch("/api/contact/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      {status !== "READ" && (
        <button
          onClick={() => updateStatus("READ")}
          className="text-xs bg-blue-500 text-white px-3 py-1 rounded"
        >
          Mark as Read
        </button>
      )}

      {status !== "RESOLVED" && (
        <button
          onClick={() => updateStatus("RESOLVED")}
          className="text-xs bg-green-500 text-white px-3 py-1 rounded"
        >
          Resolve
        </button>
      )}

      {status === "RESOLVED" && (
        <button
          onClick={() => updateStatus("UNREAD")}
          className="text-xs bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Reopen
        </button>
      )}
      <button
        onClick={() => updateStatus("HIGH_PRIORITY")}
        className="text-xs bg-orange-500 text-white px-3 py-1 rounded"
      >
        🔥 Mark Urgent
      </button>
    </div>
  );
}
