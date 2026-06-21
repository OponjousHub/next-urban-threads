import Link from "next/link";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { Star } from "lucide-react";

export default async function AdminReviewsPage() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const reviews = await prisma.review.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalReviews = reviews.length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "APPROVED",
  ).length;

  const pendingReviews = reviews.filter(
    (review) => review.status === "PENDING",
  ).length;

  const rejectedReviews = reviews.filter(
    (review) => review.status === "REJECTED",
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Reviews</p>

          <h2 className="mt-2 text-3xl font-bold">{totalReviews}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Approved</p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {approvedReviews}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>

          <h2 className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingReviews}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Rejected</p>

          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {rejectedReviews}
          </h2>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="border-t hover:bg-gray-50">
                    <td className="max-w-xs px-4 py-4">
                      <div className="font-medium">
                        {review.title || "Untitled Review"}
                      </div>

                      <div className="truncate text-sm text-gray-500">
                        {review.comment}
                      </div>
                    </td>

                    <td className="px-4 py-4">{review.product.name}</td>

                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {review.user?.name || "Customer"}
                      </div>

                      <div className="text-xs text-gray-500">
                        {review.user?.email}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {review.product.vendor?.name || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="fill-yellow-400 text-yellow-400"
                        />

                        {review.rating}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          review.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : review.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {review.createdAt.toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/reviews/${review.id}`}
                        className="
                            inline-flex items-center gap-2
                            rounded-xl
                         bg-gray-100
                            px-4 py-2
                            text-sm font-medium
                         text-gray-700
                            transition-all
                         hover:bg-gray-200
                            hover:shadow-sm
  "
                      >
                        👁 View Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
