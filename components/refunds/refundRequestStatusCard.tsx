"use client";

import {
  RefundStatus,
  RefundRequest,
  RefundTrackingEvent,
} from "@prisma/client";

type RefundWithTracking = RefundRequest & {
  trackingEvents: RefundTrackingEvent[];
};

type Props = {
  status: RefundStatus;
  refund: RefundWithTracking;
};

const stages: RefundStatus[] = [
  "REQUESTED",
  "APPROVED",
  "PROCESSING",
  "REFUNDED",
];

export default function RefundRequestStatus({ status, refund }: Props) {
  const currentIndex = stages.indexOf(status);
  const events = refund?.trackingEvents ?? [];

  const terminalStatus =
    status === "REJECTED" || status === "FAILED" || status === "CANCELLED";

  const terminalConfig = {
    REJECTED: {
      title: "Refund Rejected",
      description:
        "Your refund request was rejected and will not be processed.",
      container: "border-red-200 bg-red-50",
      icon: "bg-red-100 text-red-600",
    },

    CANCELLED: {
      title: "Refund Cancelled",
      description: "Your refund request was cancelled before it was processed.",
      container: "border-gray-200 bg-gray-50",
      icon: "bg-gray-100 text-gray-600",
    },

    FAILED: {
      title: "Refund Failed",
      description:
        "The refund could not be completed. Our support team has been notified.",
      container: "border-orange-200 bg-orange-50",
      icon: "bg-orange-100 text-orange-600",
    },
  } as const;

  const terminalInfo = terminalStatus
    ? terminalConfig[status as keyof typeof terminalConfig]
    : null;

  return (
    <div className="mt-6 mb-6 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold">Refund Progress</h2>

      {/* Main timeline */}
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const complete = currentIndex >= 0 && index <= currentIndex;

          return (
            <div key={stage} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                    complete
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>

                <span className="mt-2 text-xs font-medium">
                  {stage.replace("_", " ")}
                </span>
              </div>

              {index !== stages.length - 1 && (
                <div
                  className={`mx-2 h-1 flex-1 rounded ${
                    currentIndex >= 0 && index < currentIndex
                      ? "bg-green-600"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Terminal status */}
      {terminalInfo && (
        <div className={`mt-6 rounded-xl border p-4 ${terminalInfo.container}`}>
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${terminalInfo.icon}`}
            >
              {status === "REJECTED" && "×"}
              {status === "CANCELLED" && "−"}
              {status === "FAILED" && "!"}
            </div>

            <div>
              <p className="font-semibold">{terminalInfo.title}</p>

              <p className="mt-1 text-sm">{terminalInfo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Refund tracking events */}
      {events.length > 0 && (
        <div className="mt-6 space-y-6">
          {events.map((event, index) => (
            <div key={event.id ?? index} className="flex gap-4">
              {/* Dot */}
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-green-600" />

                {index !== events.length - 1 && (
                  <div className="mt-1 h-full w-px bg-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="pb-6">
                <p className="font-medium">{event.title}</p>

                <p className="text-sm text-gray-500">{event.description}</p>

                <p className="mt-1 text-xs text-gray-400">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
