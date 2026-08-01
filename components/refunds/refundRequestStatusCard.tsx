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

type RefundTimelineEvent = {
  title: string;
  description: string;
  date: Date;
  color: string;
};

export default function RefundRequestStatus({ status, refund }: Props) {
  const currentIndex = stages.indexOf(status);

  const terminal =
    status === "REJECTED" || status === "FAILED" || status === "CANCELLED";

  const events = refund.trackingEvents;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm mt-6">
      <h2 className="mb-6 text-lg font-semibold">Refund Progress</h2>

      {/* Main timeline */}
      {!terminal && (
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const complete = index <= currentIndex;

            return (
              <div key={stage} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold
                    ${
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
                    className={`mx-2 h-1 flex-1 rounded
                    ${index < currentIndex ? "bg-green-600" : "bg-gray-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-6 mt-6">
        {events?.map((event, index) => (
          <div key={index} className="flex gap-4">
            {/* Dot */}
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-green-600" />

              {index !== events.length - 1 && (
                <div className="mt-1 h-full w-px bg-gray-300" />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <p className="font-medium">{event?.title}</p>

              <p className="text-sm text-gray-500">{event?.description}</p>

              <p className="mt-1 text-xs text-gray-400">
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
