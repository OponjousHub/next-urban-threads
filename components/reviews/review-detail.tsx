"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useState } from "react";
import { useTenant } from "@/store/tenant-provider-context";
import { appToast } from "@/utils/appToast";
import { useRouter } from "next/navigation";
import ConfirmationModal from "../modals/ConfirmationModal";
import { FiLoader } from "react-icons/fi";
import { formatCurrency } from "@/lib/formatCurrency";

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

  const isSingleVendor = tenant.storeMode === "SINGLE_VENDOR";
  const isMultiVendor = tenant.storeMode === "MULTI_VENDOR";

  /**
   * In single-vendor mode there is no vendor context to expose.
   * In multi-vendor mode, only admins should see vendor information.
   */
  const showVendorInformation = isMultiVendor && isAdmin && !!vendor;

  /**
   * Admin/owner can moderate reviews.
   * In multi-vendor mode this remains admin-only.
   */
  const canModerate = isAdmin || isSingleVendor;

  /**
   * Delete permission.
   */
  const canDeleteReview = isSingleVendor || (isMultiVendor && isAdmin);

  const updateStatus = async (status: "APPROVED" | "REJECTED") => {
    try {
      setLoadingAction(status);
      setUpdatingStatus(true);

      // Optimistic update
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
    } catch (error) {
      console.error(error);

      setCurrentStatus(review.status);

      appToast.error("Failed", `Could not ${status.toLowerCase()} review`);
    } finally {
      setLoadingAction(null);
      setUpdatingStatus(false);
    }
  };

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

  const deleteReview = async () => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message || data?.error || "Could not delete review",
        );
      }

      appToast.success("Deleted", "Review deleted successfully");

      /**
       * Do not send a single-vendor admin to the vendor review page.
       */
      if (isSingleVendor) {
        router.push("/admin/reviews");
      } else {
        router.push("/vendor/reviews");
      }
    } catch (error) {
      console.error(error);

      appToast.error(
        "Failed",
        error instanceof Error ? error.message : "Could not delete review",
      );
    } finally {
      setDeleting(false);
    }
  };

  const vip =
    customerContext.totalSpent >= 100000 || customerContext.totalOrders >= 10;

  return (
    <>
      <div className="space-y-6 p-4 lg:p-6">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Review Details
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

              <p className="mt-1 text-sm text-gray-500">
                Review ID: {review.id}
              </p>
            </div>

            {canModerate && (
              <div className="flex flex-wrap gap-2">
                {currentStatus !== "APPROVED" && (
                  <button
                    disabled={updatingStatus}
                    onClick={() => updateStatus("APPROVED")}
                    className="
                      inline-flex items-center gap-2
                      rounded-xl
                      bg-green-600
                      px-4 py-2.5
                      text-sm font-medium
                      text-white
                      shadow-sm
                      transition
                      hover:bg-green-700
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loadingAction === "APPROVED" ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Approving...
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
                      inline-flex items-center gap-2
                      rounded-xl
                      bg-red-600
                      px-4 py-2.5
                      text-sm font-medium
                      text-white
                      shadow-sm
                      transition
                      hover:bg-red-700
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loadingAction === "REJECTED" ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Rejecting...
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

        {/* =========================================================
            TOP INFORMATION GRID
        ========================================================= */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* REVIEW */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Review</h2>

              <div className="flex gap-0.5">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={17}
                    fill="currentColor"
                    className="text-yellow-500"
                  />
                ))}
              </div>
            </div>

            {review.title && (
              <h3 className="mb-2 font-semibold text-gray-900">
                {review.title}
              </h3>
            )}

            <p className="text-sm leading-6 text-gray-700">{review.comment}</p>

            <p className="mt-4 text-xs text-gray-500">
              Posted on {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* PRODUCT */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Product
            </h2>

            <div className="flex items-center gap-4">
              <Image
                src={review.product.thumbnail}
                alt={review.product.name}
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-xl border object-cover"
              />

              <div className="min-w-0">
                <Link
                  href={`/products/${review.product.slug}`}
                  className="font-medium text-gray-900 transition hover:text-[var(--color-primary)]"
                >
                  {review.product.name}
                </Link>

                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(review.product.price, tenant.currency)}
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <span>Avg Rating:</span>

                  <span className="font-medium text-gray-900">
                    {review.product.averageRating}
                  </span>

                  <Star
                    size={14}
                    fill="currentColor"
                    className="text-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer
                </h2>

                <p className="text-sm text-gray-500">Reviewer information</p>
              </div>

              {vip && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  ⭐ VIP
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Name</p>

                <p className="mt-1 font-medium text-gray-900">
                  {review.user?.name || "Customer"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>

                <p className="mt-1 break-all font-medium text-gray-900">
                  {review.user?.email || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* VENDOR — MULTI-VENDOR ADMIN ONLY */}
          {showVendorInformation && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Vendor</h2>

                <p className="text-sm text-gray-500">
                  Store responsible for this review
                </p>
              </div>

              <div className="flex items-center gap-3">
                {vendor.logo ? (
                  <Image
                    src={vendor.logo}
                    alt={vendor.name}
                    width={52}
                    height={52}
                    className="h-[52px] w-[52px] rounded-full border object-cover"
                  />
                ) : (
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                    {vendor.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{vendor.name}</p>

                  <p className="truncate text-sm text-gray-500">
                    {vendor.email || "No email"}
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      vendor.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : vendor.status === "SUSPENDED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {vendor.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            CUSTOMER PURCHASE CONTEXT
        ========================================================= */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Purchase Context
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Purchase history and customer value.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Total Orders</p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {customerContext.totalOrders}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Total Spent</p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(customerContext.totalSpent, tenant.currency)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">First Purchase</p>

              <p className="mt-1 font-medium text-gray-900">
                {customerContext.firstPurchase
                  ? new Date(customerContext.firstPurchase).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Last Purchase</p>

              <p className="mt-1 font-medium text-gray-900">
                {customerContext.lastPurchase
                  ? new Date(customerContext.lastPurchase).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          {/* Recent orders */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Recent Orders</h4>

              <span className="text-xs text-gray-400">Last 5</span>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Order
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Total
                    </th>

                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customerContext.recentOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        #{order.id.slice(-8)}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-gray-900">
                        {formatCurrency(order.totalAmount, tenant.currency)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
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

        {/* =========================================================
            REVIEW IMAGES
        ========================================================= */}
        {review.images?.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Review Images
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {review.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border bg-gray-50"
                >
                  <Image
                    src={image}
                    alt={`Review image ${index + 1}`}
                    width={200}
                    height={200}
                    className="aspect-square w-full object-cover transition hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            VENDOR REPLY
        ========================================================= */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isSingleVendor ? "Store Reply" : "Vendor Reply"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Respond publicly to this customer review.
            </p>
          </div>

          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={5}
            placeholder="Write your response to the customer..."
            className="
              w-full
              rounded-xl
              border border-gray-300
              bg-gray-50
              p-4
              text-sm
              text-gray-900
              outline-none
              transition
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary-ring)]
            "
          />

          <div className="mt-4 flex justify-end">
            <button
              disabled={savingReply}
              onClick={saveReply}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[var(--color-primary)]
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                shadow-sm
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {savingReply && <FiLoader className="animate-spin" />}

              {savingReply
                ? "Saving..."
                : review.reply
                  ? "Update Reply"
                  : "Save Reply"}
            </button>
          </div>
        </div>

        {/* =========================================================
            EXISTING REPLY
        ========================================================= */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {isSingleVendor ? "Store Reply" : "Vendor Reply"}
          </h2>

          {review.reply ? (
            <>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm leading-6 text-gray-700">
                  {review.reply}
                </p>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Replied on{" "}
                {review.repliedAt
                  ? new Date(review.repliedAt).toLocaleDateString()
                  : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No reply yet.</p>
          )}
        </div>

        {/* =========================================================
            METADATA
        ========================================================= */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Metadata</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Helpful Votes</p>

              <p className="mt-1 font-medium text-gray-900">
                {review.helpfulCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Verified Purchase</p>

              <p className="mt-1 font-medium text-gray-900">
                {review.verifiedPurchase ? "Yes" : "No"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Created</p>

              <p className="mt-1 font-medium text-gray-900">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Updated</p>

              <p className="mt-1 font-medium text-gray-900">
                {new Date(review.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================
            MODERATION HISTORY
        ========================================================= */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Moderation History
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Track all actions performed on this review.
            </p>
          </div>

          {moderationHistory.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
              No moderation activity yet.
            </div>
          ) : (
            <div className="space-y-3">
              {moderationHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                >
                  <div
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      item.action === "APPROVED"
                        ? "bg-green-500"
                        : item.action === "REJECTED"
                          ? "bg-yellow-500"
                          : item.action === "DELETED"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-gray-900">{item.action}</p>

                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {item.note && (
                      <p className="mt-1 text-sm text-gray-600">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================
            DANGER ZONE
        ========================================================= */}
        {canDeleteReview && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-700">Danger Zone</h3>

            <p className="mt-1 text-sm leading-6 text-red-600">
              Permanently remove this review from your store. This action cannot
              be undone.
            </p>

            <button
              disabled={deleting}
              onClick={() => setShowDeleteModal(true)}
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-red-600
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                shadow-sm
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
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

      {/* =========================================================
          DELETE CONFIRMATION
      ========================================================= */}
      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteReview}
        loading={deleting}
        loadingText="Deleting..."
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        action="Delete Review"
        variant="danger"
      />
    </>
  );
}
