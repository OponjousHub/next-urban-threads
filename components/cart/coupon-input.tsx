"use client";

import { useState, useEffect } from "react";
import { appToast } from "@/utils/appToast";
import { FiLoader, FiCheckCircle } from "react-icons/fi";
import { CouponData } from "@/types/cart";
import { useCart } from "@/store/cart-context";
import { useTenant } from "@/store/tenant-provider-context";

type Props = {
  subtotal: number;
};

export default function CouponInput({ subtotal }: Props) {
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const { setCoupon, setDiscountAmount, coupon, removeCoupon } = useCart();
  const [availableCoupons, setAvailableCoupons] = useState<CouponData[]>([]);
  const [couponError, setCouponError] = useState("");

  const { tenant } = useTenant();

  useEffect(() => {
    loadCoupons();
  }, []);

  // Quick Apply Function
  async function applyExistingCoupon(code: string) {
    setCouponCode(code);

    await validateCoupon(code);
  }

  async function loadCoupons() {
    try {
      const response = await fetch("/api/coupons/active");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setAvailableCoupons(data);
    } catch (error) {
      console.error("Failed to load coupons:", error);
    }
  }

  async function validateCoupon(code: string) {
    setCouponError("");
    if (!code.trim()) {
      appToast.error("Coupon Required", "Please enter a coupon code");
      return;
    }

    // move ALL your current applyCoupon logic here
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data.message || "Invalid coupon");
      }

      const validatedCoupon = data.coupon as CouponData;

      let calculatedDiscount = 0;

      if (validatedCoupon.type === "PERCENTAGE") {
        calculatedDiscount = (subtotal * validatedCoupon.value) / 100;
      }

      if (validatedCoupon.type === "FIXED") {
        calculatedDiscount = validatedCoupon.value;
      }

      setCoupon(validatedCoupon);

      setDiscountAmount(calculatedDiscount);

      appToast.success(
        "Coupon Applied",
        `${validatedCoupon.code} applied successfully`,
      );
    } catch (err: any) {
      setCouponError(err.message);
    }
  }

  async function applyCoupon() {
    setCouponError("");
    await validateCoupon(couponCode);
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      {/*List Available coupons*/}
      {couponError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {couponError}
        </div>
      )}
      {availableCoupons.length > 0 && (
        <div className="mb-4 rounded-xl border bg-white p-4">
          <h3 className="mb-3 font-semibold">Available Coupons</h3>

          <div className="space-y-3">
            {availableCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="
            flex
            items-center
            justify-between
            rounded-lg
            border
            p-3
          "
              >
                <div>
                  <p className="font-medium">{coupon.code}</p>

                  <p className="text-sm text-gray-500">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}% off`
                      : `${tenant?.currency}${coupon.value} off`}
                  </p>
                </div>

                <button
                  onClick={() => applyExistingCoupon(coupon.code)}
                  className="
              rounded-lg
              bg-[var(--color-primary)]
              px-4
              py-2
              text-white
              text-sm
              font-medium
            "
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3">
        <h3 className="font-semibold">Coupon Code</h3>

        <p className="mt-1 text-sm text-gray-500">
          Have a discount code? Apply it below.
        </p>
      </div>

      {/*Coupon inputn card*/}
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
          onClick={() => applyCoupon()}
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

      {coupon && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{coupon.code}</p>

              <p className="text-sm text-green-700">Coupon Applied</p>
            </div>

            <button
              onClick={removeCoupon}
              className="text-sm font-medium text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
