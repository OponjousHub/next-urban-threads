"use client";

import { RefundStatus, RefundRequest } from "@prisma/client";

type Props = {
  status: RefundStatus;
  refund: RefundRequest;
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

  const events: RefundTimelineEvent[] = [
    {
      title: "Refund Requested",
      description: "Your refund request has been submitted.",
      date: refund.createdAt,
      color: "blue",
    },

    ...(refund.approvedAt
      ? [
          {
            title: "Refund Approved",
            description: "An administrator approved your refund.",
            date: refund.approvedAt,
            color: "green",
          },
        ]
      : []),

    ...(refund.processedAt
      ? [
          {
            title: "Processing Refund",
            description: "The payment gateway is processing your refund.",
            date: refund.processedAt,
            color: "yellow",
          },
        ]
      : []),

    ...(refund.refundedAt
      ? [
          {
            title: "Refund Completed",
            description: "The refund has been sent successfully.",
            date: refund.refundedAt,
            color: "green",
          },
        ]
      : []),

    ...(refund.rejectedAt
      ? [
          {
            title: "Refund Rejected",
            description: "The refund request was rejected.",
            date: refund.rejectedAt,
            color: "red",
          },
        ]
      : []),

    ...(refund.failedAt
      ? [
          {
            title: "Refund Failed",
            description: "The payment gateway could not complete the refund.",
            date: refund.failedAt,
            color: "orange",
          },
        ]
      : []),

    ...(refund.cancelledAt
      ? [
          {
            title: "Refund Cancelled",
            description: "The refund request was cancelled.",
            date: refund.cancelledAt,
            color: "gray",
          },
        ]
      : []),
  ];
  console.log("REFUND REQUEST STATUS", {
    createdAt: refund.createdAt,
    approvedAt: refund.approvedAt,
    processedAt: refund.processedAt,
    refundedAt: refund.refundedAt,
  });
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
                {new Date(event?.date).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
