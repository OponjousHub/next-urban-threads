"use client";

import { formatDistanceToNow } from "date-fns";

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
  return (
    <div className="border-t pt-6 space-y-4">
      <h3 className="font-semibold text-lg">Active Sessions</h3>

      {sessions.length === 0 && (
        <p className="text-sm text-gray-500">No active sessions</p>
      )}

      {sessions.map((session) => {
        const isCurrent = session.id === currentSessionId;

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
                className="text-red-600 text-sm hover:underline"
                onClick={() => {
                  fetch(`/api/sessions/${session.id}`, {
                    method: "DELETE",
                  }).then(() => location.reload());
                }}
              >
                Log out
              </button>
            )}
          </div>
        );
      })}

      {sessions.length > 1 && (
        <button
          className="text-sm underline text-red-600"
          onClick={() => {
            fetch("/api/sessions/logout-others", {
              method: "POST",
            }).then(() => location.reload());
          }}
        >
          Log out of all other devices
        </button>
      )}
    </div>
  );
}
