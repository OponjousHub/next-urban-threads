"use client";

import { useState } from "react";
import { createCoupon } from "@/app/actions/coupon/createCoupon";
import { useRouter } from "next/navigation";
import { appToast } from "@/utils/appToast";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

type Props = {
  mode?: "create" | "edit";
  coupon?: any;
  vendorId?: string;
  basePath: string;
  admin?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
};

export default function CouponForm({
  mode = "create",
  coupon,
  vendorId,
  basePath,
  admin,
}: Props) {
  const router = useRouter();

  const isEdit = mode === "edit";
  const isVendorCoupon = Boolean(vendorId);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    type: coupon?.type ?? "PERCENTAGE",
    value: coupon?.value ?? "",
    minimumOrderAmount: coupon?.minimumAmount ?? "",
    usageLimit: coupon?.usageLimit ?? "",
    startsAt: coupon?.startsAt
      ? new Date(coupon.startsAt).toISOString().slice(0, 16)
      : "",
    expiresAt: coupon?.expiresAt
      ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
      : "",
    active: coupon?.active ?? true,
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      if (!form.code.trim()) {
        throw new Error("Coupon code is required");
      }

      const value = Number(form.value);

      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Discount value must be greater than zero");
      }

      if (form.type === "PERCENTAGE" && value > 100) {
        throw new Error("Percentage discount cannot exceed 100%");
      }

      if (isEdit) {
        const response = await fetch(`/api/coupons/${coupon.id}/edit`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not update coupon");
        }
      } else {
        await createCoupon({
          vendorId,
          ...form,
        });
      }

      appToast.success(
        "Success",
        `Coupon ${isEdit ? "updated" : "created"} successfully`,
      );

      router.push(basePath);
      router.refresh();
    } catch (err: any) {
      appToast.error(
        "Failed",
        err.message || `Could not ${isEdit ? "update" : "create"} coupon`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeaderUI
        title="Coupons"
        subtitle={`${isEdit ? "Edit this" : "Create new"} coupon`}
        admin={admin}
      />

      <Link
        href={isEdit ? `${basePath}/${coupon?.id}` : basePath}
        className="m-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <FaArrowLeft size={12} />
        Back to Coupon details
      </Link>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* SCOPE */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="mb-2 font-semibold">Coupon Scope</h3>

            <div
              className={`rounded-xl border p-4 ${
                isVendorCoupon
                  ? "border-blue-200 bg-blue-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <p className="font-medium">
                {isVendorCoupon ? "Vendor Coupon" : "Store-wide Coupon"}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {isVendorCoupon
                  ? "This coupon applies only to products belonging to this vendor."
                  : "This coupon applies to all products in the store."}
              </p>
            </div>
          </div>

          {/* DETAILS */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="mb-5 font-semibold">Coupon Details</h3>

            <div className="space-y-4">
              <input
                placeholder="Coupon Code"
                value={form.code}
                onChange={(e) =>
                  updateField("code", e.target.value.toUpperCase())
                }
                className="w-full rounded-xl border p-3"
                required
              />

              <textarea
                rows={4}
                placeholder="Description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full rounded-xl border p-3"
              />
            </div>
          </div>

          {/* DISCOUNT */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="mb-5 font-semibold">Discount Settings</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                className="rounded-xl border p-3"
              >
                <option value="PERCENTAGE">Percentage Discount</option>
                <option value="FIXED">Fixed Amount Discount</option>
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Discount Value"
                value={form.value}
                onChange={(e) => updateField("value", e.target.value)}
                className="rounded-xl border p-3"
                required
              />

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Minimum Order Amount"
                value={form.minimumOrderAmount}
                onChange={(e) =>
                  updateField("minimumOrderAmount", e.target.value)
                }
                className="rounded-xl border p-3"
              />

              <input
                type="number"
                min="1"
                step="1"
                placeholder="Usage Limit"
                value={form.usageLimit}
                onChange={(e) => updateField("usageLimit", e.target.value)}
                className="rounded-xl border p-3"
              />
            </div>
          </div>

          {/* SCHEDULE */}
          <div className="flex flex-col gap-7 rounded-2xl border bg-white p-6">
            <div>
              <h3 className="text-lg font-semibold">Coupon Schedule</h3>

              <p className="mt-1 text-sm text-gray-500">
                Control when this coupon becomes active and when it expires.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Activation Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => updateField("startsAt", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Expiration Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => updateField("expiresAt", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="sticky top-6 rounded-2xl border bg-white p-6">
            <h3 className="font-semibold">Coupon Preview</h3>

            <div className="mt-5 rounded-xl border border-dashed p-5 text-center">
              <div className="text-2xl font-bold">{form.code || "COUPON"}</div>

              <p className="mt-2 text-sm text-gray-500">
                {form.type === "PERCENTAGE"
                  ? `${form.value || 0}% OFF`
                  : `${form.value || 0} OFF`}
              </p>

              <p className="mt-3 text-xs font-medium text-gray-500">
                {isVendorCoupon
                  ? "Valid for this vendor's products"
                  : "Valid store-wide"}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-[var(--color-primary)] py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Coupon"
                  : "Create Coupon"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
