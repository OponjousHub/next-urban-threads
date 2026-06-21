"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useState } from "react";
import { useTenant } from "@/store/tenant-provider-context";
import { appToast } from "@/utils/appToast";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "@/components/confirmDeleteModal";
import { FiLoader } from "react-icons/fi";

type ModerationHistory = {
  id: string;
  action: string;
  note: string | null;
  createdAt: Date;
};

type CustomerContext = {
  totalSpent: number;
  totalOrders: number;
  firstPurchase: Date | null;
  lastPurchase: Date | null;

  recentOrders: {
    id: string;
    createdAt: Date;
    totalAmount: number;
    status: string;
    items: number;
  }[];
};

type Props = {
  review: any;
  vendorId?: string;
  moderationHistory: ModerationHistory[];
  customerContext: CustomerContext;
  isAdmin: boolean;
  vendor?: {
    id: string;
    name: string;
    email: string | null;
    status: string;
    logo: string | null;
  } | null;
  role: string | null;
};

export default function ReviewDetail({
  review,
  moderationHistory,
  customerContext,
  isAdmin,
  vendor,
  role,
}: Props) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(review.status);
  const [reply, setReply] = useState(review.reply || "");
  const [savingReply, setSavingReply] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);

  const { tenant } = useTenant();
  const router = useRouter();

  const updateStatus = async (status: "APPROVED" | "REJECTED") => {
    try {
      setLoadingAction(status);
      setUpdatingStatus(true);
      setCurrentStatus(status);

      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error();
      }

      appToast.success(
        "Success",
        `Review ${status.toLowerCase()} successfully`,
      );

      router.refresh();
    } catch (err) {
      // rollback if failed
      setCurrentStatus(review.status);

      appToast.error("Failed", `Could not ${status.toLowerCase()} review`);
    } finally {
      setLoadingAction(null);
      setUpdatingStatus(false);
    }
  };

  // Save Reply
  const saveReply = async () => {
    try {
      setSavingReply(true);

      const response = await fetch(`/api/reviews/${review.id}/reply`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reply,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      appToast.success("Reply Saved", "Customer response updated successfully");

      router.refresh();
    } catch (error) {
      console.error(error);

      appToast.error("Failed", "Could not save reply");
    } finally {
      setSavingReply(false);
    }
  };

  // DElete review
  const deleteReview = async () => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      appToast.success("Deleted", "Review deleted successfully");

      router.push("/vendor/reviews");
    } catch (error) {
      console.error(error);

      appToast.error("Failed", "Could not delete review");
    } finally {
      setDeleting(false);
    }
  };

  const vip =
    customerContext.totalSpent >= 100000 || customerContext.totalOrders >= 10;

  const canDeleteReview =
    tenant.storeMode === "SINGLE_VENDOR" ||
    (tenant.storeMode === "MULTI_VENDOR" && isAdmin);
  return (
    <>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Review Details</h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    currentStatus === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : currentStatus === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {currentStatus}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Review ID: {review.id}
              </p>
            </div>

            {canDeleteReview && (
              <div className="flex gap-2">
                {currentStatus !== "APPROVED" && (
                  <button
                    disabled={updatingStatus}
                    onClick={() => updateStatus("APPROVED")}
                    className="
            flex items-center gap-2
            rounded-xl
            bg-green-600
            px-4 py-2
            text-white
            hover:bg-green-700
            disabled:opacity-60
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

                {currentStatus !== "REJECTED" && (
                  <button
                    disabled={updatingStatus}
                    onClick={() => updateStatus("REJECTED")}
                    className="
            flex items-center gap-2
            rounded-xl
            bg-red-600
            px-4 py-2
            text-white
            hover:bg-red-700
            disabled:opacity-60
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
            )}
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

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">Customer</h2>

              <p className="text-sm text-gray-500">
                Information about the reviewer
              </p>
            </div>

            {vip && (
              <span
                className="
          rounded-full
          border border-amber-200
          bg-amber-100
          px-3 py-1
          text-xs
          font-semibold
          text-amber-700
        "
              >
                ⭐ VIP Customer
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Name</p>

              <p className="font-medium">{review.user?.name || "Customer"}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Email</p>

              <p className="font-medium">{review.user?.email}</p>
            </div>
          </div>
        </div>

        {/*Vendor card / Admin pnly*/}
        {isAdmin && vendor && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-semibold mb-3">Vendor</h3>

            <div className="flex items-center gap-3">
              {vendor.logo && (
                <Image
                  src={vendor.logo}
                  alt={vendor.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}

              <div>
                <p className="font-medium">{vendor.name}</p>
                <p className="text-sm text-gray-500">{vendor.email}</p>
              </div>
            </div>
          </div>
        )}

        {/*Customer Purchase Context*/}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold">Customer Purchase Context</h3>

            <p className="text-sm text-gray-500 mt-1">
              Purchase history and customer value.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Total Orders</p>

              <p className="mt-1 text-2xl font-bold">
                {customerContext.totalOrders}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Total Spent</p>

              <p className="mt-1 text-2xl font-bold">
                {tenant.currency}
                {customerContext.totalSpent.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">First Purchase</p>

              <p className="mt-1 font-medium">
                {customerContext.firstPurchase
                  ? new Date(customerContext.firstPurchase).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Last Purchase</p>

              <p className="mt-1 font-medium">
                {customerContext.lastPurchase
                  ? new Date(customerContext.lastPurchase).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 font-medium">Recent Orders</h4>

            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>

                    <th className="px-4 py-3 text-left">Date</th>

                    <th className="px-4 py-3 text-left">Total</th>

                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {customerContext.recentOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="px-4 py-3">#{order.id.slice(-8)}</td>

                      <td className="px-4 py-3">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        {tenant.currency}
                        {Number(order.totalAmount).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

        {/*Vendor reply textarea*/}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Vendor Reply
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Respond publicly to this customer review.
              </p>
            </div>
          </div>

          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={5}
            placeholder="Write your response to the customer..."
            className="
      w-full rounded-xl border border-gray-300
      bg-gray-50 p-4 text-sm
      focus:border-[var(--color-primary)]
      focus:outline-none
      focus:ring-2
      focus:ring-[var(--color-primary-ring)]
    "
          />

          <div className="mt-4 flex justify-end">
            <button
              disabled={savingReply}
              onClick={saveReply}
              className="
        flex items-center gap-2
        rounded-xl
        bg-[var(--color-primary)]
        px-5 py-2.5
        text-white
        font-medium
        shadow-sm
        hover:opacity-90
        disabled:opacity-50
      "
            >
              {savingReply && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity=".25"
                  />
                  <path
                    d="M22 12a10 10 0 00-10-10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              )}

              {savingReply
                ? "Saving..."
                : review.reply
                  ? "Update Reply"
                  : "Save Reply"}
            </button>
          </div>
        </div>

        {/* Reply list*/}
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

        {/*Moderation History*/}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Moderation History</h3>

              <p className="text-sm text-gray-500">
                Track all actions performed on this review
              </p>
            </div>
          </div>

          {moderationHistory.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
              No moderation activity yet.
            </div>
          ) : (
            <div className="space-y-4">
              {moderationHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-xl border border-gray-100 p-4"
                >
                  <div
                    className={`mt-1 h-3 w-3 rounded-full ${
                      item.action === "APPROVED"
                        ? "bg-green-500"
                        : item.action === "REJECTED"
                          ? "bg-yellow-500"
                          : item.action === "DELETED"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{item.action}</p>

                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {item.note && (
                      <p className="mt-2 text-sm text-gray-600">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*Danger zone*/}
        {canDeleteReview && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-700">Danger Zone</h3>

            <p className="mt-2 text-sm text-red-600">
              Permanently remove this review from your store. This action cannot
              be undone.
            </p>

            <button
              disabled={deleting}
              onClick={() => setShowDeleteModal(true)}
              className="
                mt-4 flex items-center gap-2
                rounded-xl
               bg-red-600
                px-4 py-2
               text-white
                font-medium
               hover:bg-red-700
                disabled:opacity-50
                 "
            >
              {deleting ? (
                <>
                  <FiLoader className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Review"
              )}
            </button>
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteReview}
        loading={deleting}
        loadingText="Deleting..."
        action="Delete Review"
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot
            be undone."
      />
    </>
  );
}
