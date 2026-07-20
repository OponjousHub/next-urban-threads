"use client";

import { useState } from "react";
import SingleImageUploader from "@/components/single-image-uploader";
import AppearancePreview from "./appearance-preview";
import { appToast } from "@/utils/appToast";

type Vendor = {
  id: string;
  name: string;
  logo: string | null;
  banner: string | null;
  accentColor: string | null;
  slug: string;
  // averageRating: number | null;
  _count: {
    products: number;
    storeFollow: number;
  };
};

type Props = {
  vendor: Vendor;
};

export default function AppearanceForm({ vendor }: Props) {
  const [logo, setLogo] = useState(vendor.logo);
  const [banner, setBanner] = useState(vendor.banner);
  const [accentColor, setAccentColor] = useState(
    vendor.accentColor || "#000000",
  );

  const [savedState, setSavedState] = useState({
    logo: vendor.logo,
    banner: vendor.banner,
    accentColor: vendor.accentColor || "#000000",
  });

  const [saving, setSaving] = useState(false);

  const hasChanges =
    logo !== savedState.logo ||
    banner !== savedState.banner ||
    accentColor !== savedState.accentColor;

  // Reset Appearance function
  function resetChanges() {
    setLogo(savedState.logo);
    setBanner(savedState.banner);
    setAccentColor(savedState.accentColor);
  }

  async function saveChanges() {
    try {
      setSaving(true);

      const res = await fetch("/api/vendor/settings/appearance", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          logo,
          banner,
          accentColor,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setSavedState({
        logo,
        banner,
        accentColor,
      });

      appToast.success("Success", "Appearance updated successfully.");
    } catch (err) {
      console.error(err);
      appToast.error(
        "Fail",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Left Side */}
      <div className="space-y-8">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Appearance Settings</h2>

          <p className="mt-2 text-sm text-gray-500">
            Customize how your storefront looks to customers.
          </p>

          <div className="mt-8 space-y-8">
            <SingleImageUploader
              label="Store Logo"
              image={logo}
              onChange={setLogo}
            />

            <SingleImageUploader
              label="Store Banner"
              image={banner}
              onChange={setBanner}
              aspect="banner"
            />

            {/* Accent Color */}
            <div>
              <label className="block font-semibold mb-3">Accent Color</label>

              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-12 w-16 cursor-pointer rounded-lg border"
                />

                <input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 rounded-xl border px-4 py-3"
                />
              </div>
            </div>

            <p className="text-sm">
              {hasChanges ? (
                <span className="text-orange-600">
                  • You have unsaved changes
                </span>
              ) : (
                <span className="text-green-600">✓ All changes saved</span>
              )}
            </p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetChanges}
                disabled={!hasChanges || saving}
                className={`
      flex-1
      rounded-xl
      border
      py-3
      font-semibold
      transition

      ${
        hasChanges
          ? "border-gray-300 bg-white hover:bg-gray-50"
          : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
      }
    `}
              >
                Reset
              </button>

              <button
                type="button"
                onClick={saveChanges}
                disabled={!hasChanges || saving}
                className={`
      flex-1
      rounded-xl
      py-3
      font-semibold
      text-white
      transition

      ${
        hasChanges
          ? "bg-[var(--color-primary)] hover:opacity-90"
          : "cursor-not-allowed bg-gray-400"
      }
    `}
              >
                {saving ? "Saving..." : hasChanges ? "Save Changes" : "Saved ✓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}

      <AppearancePreview
        storeName={vendor.name}
        logo={logo}
        banner={banner}
        accentColor={accentColor}
        productCount={vendor._count.products}
        followerCount={vendor._count.storeFollow}
        storeSlug={vendor.slug}
        // rating={vendor.averageRating ?? 0}
        rating={0}
      />
    </div>
  );
}
