"use client";

import { RefundStatus } from "@prisma/client";

type Props = {
  status: RefundStatus;
};

const stages: RefundStatus[] = [
  "REQUESTED",
  "APPROVED",
  "PROCESSING",
  "REFUNDED",
];

export default function RefundRequestStatus({ status }: Props) {
  const currentIndex = stages.indexOf(status);

  const terminal =
    status === "REJECTED" || status === "FAILED" || status === "CANCELLED";

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
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

      {/* Terminal states */}
      {status === "REJECTED" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-700">Refund Request Rejected</p>

          <p className="mt-2 text-sm text-red-600">
            Unfortunately your refund request was not approved.
          </p>
        </div>
      )}

      {status === "FAILED" && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="font-semibold text-orange-700">Refund Failed</p>

          <p className="mt-2 text-sm text-orange-600">
            We couldn't complete the refund. We'll retry shortly.
          </p>
        </div>
      )}

      {status === "CANCELLED" && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="font-semibold text-gray-700">Refund Cancelled</p>

          <p className="mt-2 text-sm text-gray-600">
            This refund request was cancelled.
          </p>
        </div>
      )}
    </div>
  );
}
