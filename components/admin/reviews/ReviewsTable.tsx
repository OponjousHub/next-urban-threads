"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import AdminPagination from "@/components/admin/tables/AdminPagination";

type ReviewRow = {
  id: string;
  title: string | null;
  comment: string;
  rating: number;
  status: string;
  createdAt: string;
  product: {
    name: string;
    vendorName: string | null;
  };
  user: {
    name: string | null;
    email: string | null;
  } | null;
};

type Props = {
  reviews: ReviewRow[];
};

const PAGE_SIZE = 10;

export default function ReviewsTable({ reviews }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(reviews.length / PAGE_SIZE);
  const visibleReviews = reviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
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
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-gray-800">
                      No reviews yet
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-gray-500">
                      Customer reviews will appear here once customers start
                      reviewing your products.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleReviews.map((review) => (
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
                    {review.product.vendorName || "-"}
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
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/reviews/${review.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 hover:shadow-sm"
                    >
                      View Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {reviews.length > 0 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={reviews.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
