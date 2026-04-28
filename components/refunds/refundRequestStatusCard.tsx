import {
  RefundRequest,
  PaymentStatus,
  OrderStatus,
  OrderItem,
} from "@prisma/client";

type Order = {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paymentReference: string | null;
  items: OrderItem[];
  createdAt: string;
  refundRequest: RefundRequest[];
};

export function RefundRequestStatus({ order }: { order: Order }) {
  return (
    <>
      <h2 className="text-2xl font-semibold mt-10 mb-4">Refunds</h2>

      {order.refundRequest?.length === 0 ? (
        <p className="text-sm text-gray-500">No refund requests</p>
      ) : (
        <div className="space-y-4">
          {order.refundRequest.map((refund) => (
            <div key={refund.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <p className="font-semibold">{refund.reason}</p>

                <span
                  className={`text-sm font-medium ${
                    refund.status === "REFUNDED"
                      ? "text-green-600"
                      : refund.status === "FAILED"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {refund.status}
                </span>
              </div>

              <p className="text-sm text-gray-600">
                Requested: ${refund.requestedAmount}
              </p>

              {refund.approvedAmount && (
                <p className="text-sm text-gray-600">
                  Approved: ${refund.approvedAmount}
                </p>
              )}

              <p className="text-xs text-gray-400">
                {new Date(refund.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
