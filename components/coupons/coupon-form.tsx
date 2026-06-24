"use client";

import { useState } from "react";
import { createCoupon } from "@/app/actions/coupon/createCoupon";
import { useRouter } from "next/navigation";
import { appToast } from "@/utils/appToast";

type Props = {
  mode?: "create" | "edit";
  coupon?: any;
  vendorId?: string;
};

export default function CouponForm({ mode, coupon, vendorId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  console.log("minimumOrderAmount:", coupon?.minimumOrderAmount);
  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    type: coupon?.type ?? "PERCENTAGE",
    value: coupon?.value ?? "",
    minimumOrderAmount: coupon?.minimumAmount ?? "",
    usageLimit: coupon?.usageLimit ?? "",
    startsAt: coupon?.startsAt ?? "",
    expiresAt: coupon?.expiresAt ?? "",
    active: coupon?.active ?? true,
  });
  console.log("COUPON DATE:", coupon.startsAt);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      if (mode === "edit") {
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
        `Coupon ${mode === "edit" ? "updated" : "created"} successfully`,
      );

      router.push("/vendor/coupons");
      router.refresh();
    } catch (err: any) {
      appToast.error(
        "Failed",
        err.message ||
          `Could not ${mode === "edit" ? "update" : "create"} coupon`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      {/* LEFT */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-semibold mb-5">Coupon Details</h3>

          <div className="space-y-4">
            <input
              placeholder="Coupon Code"
              value={form.code}
              onChange={(e) =>
                setForm({
                  ...form,
                  code: e.target.value.toUpperCase(),
                })
              }
              className="w-full rounded-xl border p-3"
              required
            />

            <textarea
              rows={4}
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3"
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-semibold mb-5">Discount Settings</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
              className="rounded-xl border p-3"
            >
              <option value="PERCENTAGE">Percentage Discount</option>

              <option value="FIXED">Fixed Amount Discount</option>
            </select>

            <input
              type="number"
              placeholder="Discount Value"
              value={form.value}
              onChange={(e) =>
                setForm({
                  ...form,
                  value: e.target.value,
                })
              }
              className="rounded-xl border p-3"
              required
            />

            <input
              type="number"
              placeholder="Minimum Order Amount"
              value={form.minimumOrderAmount}
              onChange={(e) =>
                setForm({
                  ...form,
                  minimumOrderAmount: e.target.value,
                })
              }
              className="rounded-xl border p-3"
            />

            <input
              type="number"
              placeholder="Usage Limit"
              value={form.usageLimit}
              onChange={(e) =>
                setForm({
                  ...form,
                  usageLimit: e.target.value,
                })
              }
              className="rounded-xl border p-3"
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 flex flex-col gap-7">
          <div className="grid ">
            <h3 className="text-lg font-semibold">Coupon Schedule</h3>

            <p className="mt-1 text-sm text-gray-500">
              Control when this coupon becomes active and when it expires.
            </p>
          </div>
          {/* Starts At */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Activation Date & Time
              </label>

              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) =>
                  setForm({
                    ...form,
                    startsAt: e.target.value,
                  })
                }
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-3
                  text-sm
                  focus:border-[var(--color-primary)]
                  focus:outline-none
                "
              />

              <p className="mt-1 text-xs text-gray-500">
                Customers can start using this coupon from this date.
              </p>
            </div>

            {/* Expires At */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Expiration Date & Time
              </label>

              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expiresAt: e.target.value,
                  })
                }
                className="
                w-full rounded-xl border border-gray-300
                px-4 py-3
                text-sm
                focus:border-[var(--color-primary)]
                focus:outline-none
              "
              />

              <p className="mt-1 text-xs text-gray-500">
                The coupon automatically stops working after this date.
              </p>
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
          </div>

          <button
            disabled={loading}
            className="
              mt-6
              w-full
              rounded-xl
              bg-[var(--color-primary)]
              py-3
              text-white
              font-medium
            "
          >
            {loading
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
                ? "Update Coupon"
                : "Create Coupon"}
          </button>
        </div>
      </div>
    </form>
  );
}
