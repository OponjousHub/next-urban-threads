"use client";

import Image from "next/image";
import { Store, ShoppingBag } from "lucide-react";

type Props = {
  storeName: string;
  logo: string | null;
  banner: string | null;
  accentColor: string;
};

export default function AppearancePreview({
  storeName,
  logo,
  banner,
  accentColor,
}: Props) {
  return (
    <div className="sticky top-6">
      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-semibold">Live Preview</h2>

          <p className="mt-1 text-sm text-gray-500">
            This is how customers will see your storefront.
          </p>
        </div>

        {/* Banner */}
        <div className="relative h-48 bg-gray-100">
          {banner ? (
            <Image
              src={banner}
              alt="Store banner"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Banner Preview
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="-mt-12 px-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
            {logo ? (
              <Image
                src={logo}
                alt="Store logo"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100">
                <Store className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Store Info */}
        <div className="px-6 pt-5 pb-8">
          <h3 className="text-2xl font-bold text-gray-900">{storeName}</h3>

          <p className="mt-2 text-sm text-gray-500">
            Premium online store powered by your marketplace.
          </p>

          {/* Sample Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-xl font-bold">248</p>
              <p className="text-xs text-gray-500">Products</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-xl font-bold">1.2K</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-xl font-bold">4.9★</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </div>

          {/* Preview Button */}
          <button
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition"
            style={{
              backgroundColor: accentColor,
            }}
          >
            <ShoppingBag size={18} />
            Visit Store
          </button>

          {/* Accent Color Preview */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-gray-600">
              Accent Color
            </p>

            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full border"
                style={{
                  backgroundColor: accentColor,
                }}
              />

              <span className="font-mono text-sm text-gray-600">
                {accentColor}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
