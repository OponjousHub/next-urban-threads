"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toastSuccess, toastError } from "@/utils/toast-notification";

type Session = {
  id: string;
  deviceName: string;
  ipAddress: string;
  location?: string | null;
  lastActiveAt: string;
};

export default function ActiveSessionsSection({
  sessions,
  currentSessionId,
}: {
  sessions: Session[];
  currentSessionId: string | null;
}) {
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [sessionsState, setSessionsState] = useState(sessions);

  return (
    <div className="border-t pt-6 space-y-4">
      <h3 className="font-semibold text-lg">Active Sessions</h3>

      {sessionsState.length === 0 && (
        <p className="text-sm text-gray-500">No active sessions</p>
      )}

      {sessionsState.map((session) => {
        const isCurrent = session.id === currentSessionId;
        console.log("DB SESSION ID:", session.id);

        return (
          <div
            key={session.id}
            className="border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{session.deviceName}</p>

              <p className="text-sm text-gray-500">IP: {session.ipAddress}</p>

              {session.location && (
                <p className="text-sm text-gray-500">{session.location}</p>
              )}

              <p className="text-xs text-gray-400 mt-1">
                Last active{" "}
                {formatDistanceToNow(new Date(session.lastActiveAt), {
                  addSuffix: true,
                })}
              </p>

              {isCurrent && (
                <p className="text-green-600 text-sm mt-1">Current Device</p>
              )}
            </div>

            {!isCurrent && (
              <button
                disabled={loadingSessionId === session.id}
                className="text-red-600 text-sm hover:underline"
                onClick={async () => {
                  setLoadingSessionId(session.id);
                  const res = await fetch(`/api/sessions/${session.id}`, {
                    method: "DELETE",
                  });

                  if (res.ok) {
                    toastSuccess("Session logged out");

                    // remove from UI immediately
                    setSessionsState((prev) =>
                      prev.filter((s) => s.id !== session.id),
                    );
                  } else {
                    toastError("Failed to logout session");
                  }

                  setLoadingSessionId(null);
                }}
              >
                {loadingSessionId === session.id ? "Logging out..." : "Log out"}
              </button>
            )}
          </div>
        );
      })}

      {sessionsState.length > 1 && (
        <button
          className="text-sm underline text-red-600"
          onClick={() => {
            fetch("/api/sessions/logout-others", {
              method: "POST",
            }).then((res) => {
              if (res.ok) {
                toastSuccess("Logged out of other devices");

                setSessionsState((prev) =>
                  prev.filter((s) => s.id === currentSessionId),
                );
              } else {
                toastError("Failed to logout other devices");
              }
            });
          }}
        >
          Log out of all other devices
        </button>
      )}
    </div>
  );
}
