"use client";

import { motion } from "framer-motion";

type Props = {
  order: any;
};

const steps = ["REQUESTED", "PROCESSING", "REFUNDED", "FAILED"];

export default function RefundRequestStatus({ order }: Props) {
  const refunds = order?.refundRequests ?? order?.refundRequest ?? [];

  if (!refunds.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Refunds</h2>

      <div className="space-y-6">
        {refunds.map((refund: any) => {
          const currentIndex = steps.indexOf(refund.status);
          const isFailed = refund.status === "FAILED";

          return (
            <div
              key={refund.id}
              className="border rounded-2xl p-6 bg-white shadow-sm"
            >
              {/* 🔥 TIMELINE */}
              <div className="relative mb-6">
                {/* BASE LINE */}
                <div className="absolute top-2 left-0 right-0 h-[3px] bg-gray-200" />

                {/* ACTIVE LINE */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIndex + 0.5) / steps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.6 }}
                  className={`absolute top-2 left-0 h-[3px] ${
                    isFailed ? "bg-red-400" : "bg-green-500"
                  }`}
                />

                {/* STEPS */}
                <div className="relative flex justify-between">
                  {steps.map((step, i) => {
                    const isActive = i <= currentIndex;

                    return (
                      <div
                        key={step}
                        className="flex flex-col items-center w-full"
                      >
                        {/* DOT */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{
                            scale: isActive ? 1.2 : 1,
                            opacity: 1,
                          }}
                          transition={{
                            duration: 0.3,
                            delay: i * 0.15,
                          }}
                          className={`w-4 h-4 rounded-full z-10 ${
                            isActive
                              ? isFailed
                                ? "bg-red-500"
                                : "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />

                        {/* LABEL BELOW DOT ✅ */}
                        <span
                          className={`text-xs mt-2 ${
                            isActive
                              ? "text-black font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DETAILS */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-semibold capitalize">{refund.reason}</p>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      refund.status === "REFUNDED"
                        ? "bg-green-100 text-green-700"
                        : refund.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : refund.status === "PROCESSING"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {refund.status}
                  </span>
                </div>

                {refund.description && (
                  <p className="text-sm text-gray-600">{refund.description}</p>
                )}

                <div className="flex gap-4 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Requested:</span> $
                    {refund.requestedAmount}
                  </p>

                  {refund.approvedAmount && (
                    <p>
                      <span className="font-medium">Approved:</span> $
                      {refund.approvedAmount}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  {new Date(refund.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
