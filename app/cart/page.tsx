"use client";

// import { useState } from "react";
import { useCart } from "@/store/cart-context";
import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiMinus } from "react-icons/fi";

// interface CartItem {
//   id: number;
//   name: string;
//   image: string;
//   price: number;
//   quantity: number;
// }

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const updateProductQuantity = (id: number, delta: number) => {
    updateQuantity(id, delta);
  };

  const removeItem = (id: number) => {
    removeFromCart(id);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

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
                <div className="relative flex flex-shrink-0 h-24 w-32 items-center space-x-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-gray-500">${item.price}</p>
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
                    ${(item.price * item.quantity).toFixed(2)}
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Order Summary
        </h2>

        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between font-semibold text-gray-900 text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <Link href={"/checkout"}>
          <button
            disabled={cartItems.length === 0}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-60"
          >
            Proceed to Checkout
          </button>
        </Link>
      </div>
    </div>
  );
}
