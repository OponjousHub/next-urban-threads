"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useState } from "react";
import { useTenant } from "@/store/tenant-provider-context";
import { appToast } from "@/utils/appToast";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";

type Props = {
  review: any;
  vendorId: string;
};

export default function ReviewDetail({ review }: Props) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { tenant } = useTenant();
  const router = useRouter();

  const updateStatus = async (status: "APPROVED" | "REJECTED") => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewId: review.id,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(error);
        throw new Error(error);
      }

      appToast.success(
        "Success",
        `Review  ${status === "REJECTED" ? "rejected" : "approved"} successfully`,
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      appToast.error(
        "Failed",
        `Could not ${status === "REJECTED" ? "rejected" : "approved"} review.`,
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Review Details</h1>

              <p className="mt-1 text-sm text-gray-500">
                Review ID: {review.id}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <h3 className="mb-4 font-semibold">Moderation</h3>

              <div className="mb-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    review.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : review.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {review.status}
                </span>
              </div>

              {/* ACTION BAR */}
              <div className="mb-6 flex gap-2">
                {review.status !== "APPROVED" && (
                  <button
                    disabled={updatingStatus}
                    onClick={() => updateStatus("APPROVED")}
                    className="
    flex items-center justify-center gap-2
    rounded-lg bg-green-600 px-4 py-2
    text-white disabled:opacity-70
  "
                  >
                    {updatingStatus ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Approve"
                    )}
                  </button>
                )}

                {review.status !== "REJECTED" && (
                  <button
                    disabled={updatingStatus}
                    onClick={() => updateStatus("REJECTED")}
                    className="
    flex items-center justify-center gap-2
    rounded-lg bg-red-600 px-4 py-2
    text-white disabled:opacity-70
  "
                  >
                    {updatingStatus ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Reject"
                    )}
                  </button>
                )}
              </div>

              {/* Reply editor comes next */}
            </div>
          </div>
        </div>

        {/* Product */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Product</h2>

          <div className="flex items-center gap-4">
            <Image
              src={review.product.thumbnail}
              alt={review.product.name}
              width={80}
              height={80}
              className="rounded-lg border object-cover"
            />

            <div>
              <Link
                href={`/products/${review.product.slug}`}
                className="font-medium hover:text-blue-600"
              >
                {review.product.name}
              </Link>

              <p className="text-sm text-gray-500">
                {tenant.currency}
                {review.product.price.toLocaleString()}
              </p>

              <p className="text-sm text-gray-500">
                Avg Rating: {review.product.averageRating}
              </p>
            </div>
          </div>
        </div>

        {/* Reviewer */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Customer</h2>

          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {review.user?.name || "Customer"}
            </p>

            <p>
              <strong>Email:</strong> {review.user?.email}
            </p>
          </div>
        </div>

        {/* Review */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Review</h2>

          <div className="mb-3 flex gap-1">
            {[...Array(review.rating)].map((_, i) => (
              <Star
                key={i}
                size={18}
                fill="currentColor"
                className="text-yellow-500"
              />
            ))}
          </div>

          {review.title && (
            <h3 className="mb-2 font-semibold">{review.title}</h3>
          )}

          <p className="text-gray-700">{review.comment}</p>

          <p className="mt-4 text-xs text-gray-500">
            Posted on {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Images */}
        {review.images?.length > 0 && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Review Images</h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {review.images.map((image: string, index: number) => (
                <Image
                  key={index}
                  src={image}
                  alt=""
                  width={200}
                  height={200}
                  className="rounded-lg border object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Reply */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Vendor Reply</h2>

          {review.reply ? (
            <>
              <p>{review.reply}</p>

              <p className="mt-2 text-xs text-gray-500">
                Replied on{" "}
                {review.repliedAt
                  ? new Date(review.repliedAt).toLocaleDateString()
                  : ""}
              </p>
            </>
          ) : (
            <p className="text-gray-500">No reply yet</p>
          )}
        </div>

        {/* Metadata */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Metadata</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <strong>Helpful Votes:</strong> {review.helpfulCount}
            </div>

            <div>
              <strong>Verified Purchase:</strong>{" "}
              {review.verifiedPurchase ? "Yes" : "No"}
            </div>

            <div>
              <strong>Created:</strong>{" "}
              {new Date(review.createdAt).toLocaleDateString()}
            </div>

            <div>
              <strong>Updated:</strong>{" "}
              {new Date(review.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
