import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import VendorHeaderUI from "@/components/vendor/vendorHeader";

export default async function PayoutFullHistory() {
  const { tenant } = await getAuthPayload();

  const { vendor } = await getCurrentVendor();

  if (!tenant || !vendor) {
    redirect("/vendor");
  }

  const payoutHistory = await prisma.vendorPayout.findMany({
    where: {
      vendorId: vendor.id,
      tenantId: tenant.id,
    },
    orderBy: {
      requestedAt: "desc",
    },
  });

  return (
    <>
      <VendorHeaderUI
        title="Payouts Full History"
        subtitle="Track all your earnings and withdrawals"
        vendor={vendor}
      />

      {/*Vendor Withdrawal record*/}
      <div className="mt-8 rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Withdrawal History</h2>

          <p className="mt-1 text-sm text-gray-500">
            All withdrawal requests made from your account.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left uppercase text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Admin Note</th>
                <th className="px-5 py-3">Paid</th>
              </tr>
            </thead>

            <tbody>
              {payoutHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No withdrawal requests yet.
                  </td>
                </tr>
              ) : (
                payoutHistory.map((payout) => (
                  <tr key={payout.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-4">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {tenant.currency}
                      {payout.amount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      {payout.status === "PENDING" && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                          Pending
                        </span>
                      )}

                      {payout.status === "APPROVED" && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                          Approved
                        </span>
                      )}

                      {payout.status === "PAID" && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                          Paid
                        </span>
                      )}

                      {payout.status === "REJECTED" && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-gray-600">
                      {payout.note ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      {payout.paidAt
                        ? new Date(payout.paidAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
