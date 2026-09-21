"use client";

import Link from "next/link";

type ReviewRow = {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  status: string;
  verifiedPurchase: boolean;
  createdAt: Date;
};

type Props = {
  reviews: ReviewRow[];
  basePath: string;
};

export default function ReviewTable({ reviews, basePath }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium">
                    {review.productName}
                  </td>

                  <td className="px-4 py-4">{review.customerName}</td>

                  <td className="px-4 py-4">{"⭐".repeat(review.rating)}</td>

                  <td className="px-4 py-4">
                    {review.verifiedPurchase ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        No
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        review.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : review.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
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
                      href={`${basePath}/${review.id}`}
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
  );
}
