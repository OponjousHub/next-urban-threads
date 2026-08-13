"use client";

import { useState, useEffect } from "react";

import { appToast } from "@/utils/appToast";
import { FiLoader, FiCheckCircle, FiX } from "react-icons/fi";

import { CouponData } from "@/types/cart";

import { useCart } from "@/store/cart-context";
import { useTenant } from "@/store/tenant-provider-context";

type Props = {
  subtotal: number;
};

export default function CouponInput({ subtotal }: Props) {
  const { cartItems, coupons, setCoupons, setDiscountAmount, removeCoupon } =
    useCart();

  const { tenant } = useTenant();

  const [couponCode, setCouponCode] = useState("");

  const [applying, setApplying] = useState(false);

  const [availableCoupons, setAvailableCoupons] = useState<CouponData[]>([]);

  const [couponError, setCouponError] = useState("");

  // ---------------------------------------------------------
  // Load coupons whenever cart changes
  // ---------------------------------------------------------

  useEffect(() => {
    loadCoupons();
  }, [cartItems]);

  async function loadCoupons() {
    if (!cartItems.length) {
      setAvailableCoupons([]);
      return;
    }

    try {
      const response = await fetch("/api/coupons/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setAvailableCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load coupons:", error);

      setAvailableCoupons([]);
    }
  }

  // ---------------------------------------------------------
  // Apply coupon
  // ---------------------------------------------------------

  async function validateCoupon(code: string) {
    setCouponError("");

    if (!code.trim()) {
      appToast.error("Coupon Required", "Please enter a coupon code");
      return;
    }

    if (coupons.some((coupon) => coupon.code === code.trim().toUpperCase())) {
      setCouponError("This coupon is already applied.");
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
          code,
          subtotal,

          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),

          appliedCouponIds: coupons.map((coupon) => coupon.id),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data.message || "Invalid coupon");
      }

      const validatedCoupon = data.coupon as CouponData;

      setCoupons((previous) => [
        ...previous,
        {
          id: validatedCoupon.id,

          code: validatedCoupon.code,

          type: validatedCoupon.type,

          value: validatedCoupon.value,

          vendorId: validatedCoupon.vendorId ?? null,
        },
      ]);

      setDiscountAmount(Number(data.totalDiscount));

      setCouponCode("");

      await loadCoupons();

      appToast.success(
        "Coupon Applied",
        `${validatedCoupon.code} applied successfully`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not apply coupon";

      setCouponError(message);
    } finally {
      setApplying(false);
    }
  }

  // ---------------------------------------------------------
  // Quick apply
  // ---------------------------------------------------------

  async function applyExistingCoupon(code: string) {
    await validateCoupon(code);
  }

  // ---------------------------------------------------------
  // Remove coupon
  // ---------------------------------------------------------

  async function handleRemoveCoupon(couponId: string) {
    removeCoupon(couponId);

    // Recalculate the remaining stack
    // using the server.

    const remainingCoupons = coupons.filter((coupon) => coupon.id !== couponId);

    if (!remainingCoupons.length) {
      setDiscountAmount(0);
      return;
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: remainingCoupons[remainingCoupons.length - 1].code,

          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),

          appliedCouponIds: remainingCoupons
            .slice(0, -1)
            .map((coupon) => coupon.id),
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setDiscountAmount(Number(data.totalDiscount));
      }
    } catch (error) {
      console.error("Failed to recalculate coupons:", error);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      {/* -------------------------------------------------- */}
      {/* Applied Coupons */}
      {/* -------------------------------------------------- */}

      {coupons.length > 0 && (
        <div className="mb-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Applied Coupons</h3>

          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4"
            >
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-green-600" />

                <div>
                  <p className="font-semibold text-green-800">{coupon.code}</p>

                  <p className="text-xs text-green-700">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}% off`
                      : `${tenant.currency}${coupon.value} off`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveCoupon(coupon.id)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-100"
                aria-label={`Remove ${coupon.code}`}
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* Error */}
      {/* -------------------------------------------------- */}

      {couponError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {couponError}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* Available Coupons */}
      {/* -------------------------------------------------- */}

      {availableCoupons.filter(
        (coupon) => !coupons.some((applied) => applied.id === coupon.id),
      ).length > 0 && (
        <div className="mb-5 rounded-xl border bg-gray-50 p-4">
          <h3 className="mb-3 font-semibold">Available Coupons</h3>

          <div className="space-y-3">
            {availableCoupons
              .filter(
                (coupon) =>
                  !coupons.some((applied) => applied.id === coupon.id),
              )
              .map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-3"
                >
                  <div>
                    <p className="font-medium">{coupon.code}</p>

                    <p className="text-sm text-gray-500">
                      {coupon.type === "PERCENTAGE"
                        ? `${coupon.value}% off`
                        : `${tenant.currency}${coupon.value} off`}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={applying}
                    onClick={() => applyExistingCoupon(coupon.code)}
                    className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    Apply
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* Manual Coupon */}
      {/* -------------------------------------------------- */}

      <div className="mb-3">
        <h3 className="font-semibold">Coupon Code</h3>

        <p className="mt-1 text-sm text-gray-500">
          You can apply more than one qualifying coupon.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 rounded-xl border px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />

        <button
          type="button"
          onClick={() => validateCoupon(couponCode)}
          disabled={applying}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
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
    </div>
  );
}
