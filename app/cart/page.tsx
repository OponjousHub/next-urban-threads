"use client";

import { useCart } from "@/store/cart-context";
import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useTenant } from "@/store/tenant-provider-context";
import CouponInput from "@/components/cart/coupon-input";
import { useState, useEffect } from "react";
import { Country, State } from "country-state-city";

export type AvailableShippingMethod = {
  rateId: string;
  methodId: string;
  method: string;
  estimate: string | null;
  amount: number;
};

export default function CartPage() {
  const [estimatedShipping, setEstimatedShipping] = useState(0);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  const [shippingMethods, setShippingMethods] = useState<
    AvailableShippingMethod[]
  >([]);
  const [selectedMethod, setSelectedMethod] =
    useState<AvailableShippingMethod | null>(null);

  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(country);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    coupon,
    discountAmount,
    removeCoupon,
  } = useCart();

  useEffect(() => {
    estimateShipping();
  }, [country, state, cartItems]);

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
  const total = subtotal + estimatedShipping - discountAmount;

  // Shipping Calculator
  const estimateShipping = async () => {
    if (!country || !state || cartItems.length === 0) return;

    const res = await fetch("/api/shipping/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        country,
        state,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    });

    const methods = await res.json();

    if (!Array.isArray(methods)) {
      setShippingMethods([]);
      setSelectedMethod(null);
      setEstimatedShipping(0);
      return;
    }

    setShippingMethods(methods);

    if (methods.length) {
      setSelectedMethod(methods[0]);
      setEstimatedShipping(methods[0].amount);
    }
  };

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

          {/*Shipping Estimator UI*/}
          <div className="mt-6 border-t pt-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Estimate Shipping
            </h3>

            {/* Country */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>

              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setState("");
                  setShippingMethods([]);
                  setSelectedMethod(null);
                  setEstimatedShipping(0);
                }}
                className="w-full border rounded-lg px-4 py-3 text-gray-800 bg-white"
              >
                <option value="">Select Country</option>

                {countries.map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>

              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={!country}
                className="w-full border rounded-lg px-4 py-3 text-gray-800 bg-white disabled:bg-gray-100"
              >
                <option value="">
                  {country ? "Select State" : "Select Country First"}
                </option>

                {states.map((state) => (
                  <option key={state.isoCode} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between font-semibold text-gray-900 text-lg">
            <span>Total</span>
            <span>
              {tenant.currency}
              {total.toFixed(2)}
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Shipping and taxes will be calculated during checkout.
          </p>
        </div>
        <Link href={"/checkout"}>
          <button
            disabled={cartItems.length === 0}
            className="mt-6 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium py-3 rounded-xl transition disabled:opacity-60"
          >
            Continue to Secure Checkout
          </button>
        </Link>
      </div>
    </div>
  );
}
