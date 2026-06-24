"use client";

import { useState } from "react";
import { appToast } from "@/utils/appToast";
import { FiLoader, FiCheckCircle } from "react-icons/fi";
import { CouponData } from "@/types/cart";

type Props = {
  subtotal: number;
  onCouponApplied: (coupon: CouponData, discountAmount: number) => void;
};

export default function CouponInput({ subtotal, onCouponApplied }: Props) {
  const [couponCode, setCouponCode] = useState("");

  const [coupon, setCoupon] = useState<CouponData | null>(null);

  const [applying, setApplying] = useState(false);

  async function applyCoupon() {
    if (!couponCode.trim()) {
      appToast.error("Coupon Required", "Please enter a coupon code");

      return;
    }

    try {
      setApplying(true);

      const response = await fetch("/api/coupons/validate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          code: couponCode,
          subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data.message || "Invalid coupon");
      }

      const validatedCoupon = data.coupon as CouponData;

      let discountAmount = 0;

      if (validatedCoupon.type === "PERCENTAGE") {
        discountAmount = (subtotal * validatedCoupon.value) / 100;
      }

      if (validatedCoupon.type === "FIXED") {
        discountAmount = validatedCoupon.value;
      }

      setCoupon(validatedCoupon);

      onCouponApplied(validatedCoupon, discountAmount);

      appToast.success(
        "Coupon Applied",
        `${validatedCoupon.code} applied successfully`,
      );
    } catch (err: any) {
      appToast.error("Invalid Coupon", err.message);
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-3">
        <h3 className="font-semibold">Coupon Code</h3>

        <p className="mt-1 text-sm text-gray-500">
          Have a discount code? Apply it below.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="
            flex-1
            rounded-xl
            border
            px-4
            py-3
            text-sm
            focus:border-[var(--color-primary)]
            focus:outline-none
          "
        />

        <button
          type="button"
          onClick={applyCoupon}
          disabled={applying}
          className="
            flex items-center gap-2
            rounded-xl
            bg-[var(--color-primary)]
            px-5
            py-3
            text-white
            font-medium
            hover:opacity-90
            disabled:opacity-60
          "
        >
          {applying ? (
            <>
              <FiLoader className="animate-spin" />
              Applying...
            </>
          ) : (
            "Apply"
          )}
        </button>
      </div>

      {coupon && (
        <div
          className="
            mt-4
            flex items-center gap-2
            rounded-xl
            border border-green-200
            bg-green-50
            px-4 py-3
            text-sm
            text-green-700
          "
        >
          <FiCheckCircle />

          <span>
            Coupon <strong>{coupon.code}</strong> applied successfully.
          </span>
        </div>
      )}
    </div>
  );
}
