"use client";

import { useCart } from "@/store/cart-context";
import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useTenant } from "@/store/tenant-provider-context";
import { useState } from "react";
import CouponInput from "@/components/cart/coupon-input";
import { CouponData } from "@/types/cart";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    coupon,
    discountAmount,
    removeCoupon,
  } = useCart();

  const { tenant } = useTenant();
  const updateProductQuantity = (id: string, delta: number) => {
    updateQuantity(id, delta);
  };

  const removeItem = (id: string) => {
    removeFromCart(id);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;
  console.log("CART ITEMS", cartItems);

  // Applying coupon
  // async function applyCoupon() {
  //   try {
  //     setApplyingCoupon(true);

  //     const response = await fetch("/api/coupons/validate", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         code: couponCode,
  //         subtotal,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok || !data.valid) {
  //       throw new Error(data.message);
  //     }

  //     const validatedCoupon = data.coupon;

  //     let discount = 0;

  //     if (validatedCoupon.type === "PERCENTAGE") {
  //       discount = (subtotal * validatedCoupon.value) / 100;
  //     }

  //     if (validatedCoupon.type === "FIXED") {
  //       discount = validatedCoupon.value;
  //     }

  //     setCoupon(validatedCoupon);

  //     setDiscountAmount(discount);

  //     appToast.success(
  //       "Coupon Applied",
  //       `${validatedCoupon.code} applied successfully`,
  //     );
  //   } catch (err: any) {
  //     appToast.error("Invalid Coupon", err.message);
  //   } finally {
  //     setApplyingCoupon(false);
  //   }
  // }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* CART ITEMS */}
      <div className="lg:col-span-2 space-y-6 ">
        <h1 className="text-3xl font-semibold mb-4 text-gray-800">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          cartItems.map((item) => {
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow-sm p-4 border mb-4xl border-gray-100"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Link href={`/products/details/${item.productId}`}>
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  <div className="min-w-0">
                    <Link href={`/products/details/${item.productId}`}>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                    </Link>

                    {item.variantColor && (
                      <p className="text-sm text-gray-500">
                        Color: {item.variantColor}
                      </p>
                    )}

                    {item.variantSize && (
                      <p className="text-sm text-gray-500">
                        Size: {item.variantSize}
                      </p>
                    )}

                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {tenant.currency}
                      {item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center mt-4 sm:mt-0 space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateProductQuantity(item.id, -1)}
                      className="px-3 py-1 text-gray-700 hover:text-indigo-600"
                    >
                      <FiMinus />
                    </button>
                    <span className="px-4 py-1 text-gray-800 font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateProductQuantity(item.id, 1)}
                      className="px-3 py-1 text-gray-700 hover:text-indigo-600"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <p className="text-gray-800 font-semibold">
                    {tenant.currency}
                    {(item.price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ORDER SUMMARY */}
      <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-fit">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Order Summary
        </h2>

        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {tenant.currency}
              {subtotal.toFixed(2)}
            </span>
          </div>

          <CouponInput subtotal={subtotal} />

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({coupon?.code})</span>

              <span>
                -{tenant.currency}
                {discountAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {tenant.currency}
              {shipping.toFixed(2)}
            </span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between font-semibold text-gray-900 text-lg">
            <span>Total</span>
            <span>
              {tenant.currency}
              {total.toFixed(2)}
            </span>
          </div>
        </div>
        <Link href={"/checkout"}>
          <button
            disabled={cartItems.length === 0}
            className="mt-6 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium py-3 rounded-xl transition disabled:opacity-60"
          >
            Proceed to Checkout
          </button>
        </Link>
      </div>
    </div>
  );
}
