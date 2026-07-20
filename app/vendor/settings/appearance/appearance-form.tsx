"use client";

import { useState } from "react";
import SingleImageUploader from "@/components/single-image-uploader";
import AppearancePreview from "./appearance-preview";

type Vendor = {
  id: string;
  name: string;
  logo: string | null;
  banner: string | null;
  accentColor: string | null;
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

  const [saving, setSaving] = useState(false);

  const hasChanges =
    logo !== vendor.logo ||
    banner !== vendor.banner ||
    accentColor !== (vendor.accentColor || "#000000");

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

      // We'll replace this with appToast later if you prefer.
    } catch (err) {
      console.error(err);
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

            <button
              onClick={saveChanges}
              disabled={!hasChanges || saving}
              className={`
                w-full
                rounded-xl
                py-3
                font-semibold
                text-white
                transition

                ${
                  hasChanges
                    ? "bg-[var(--color-primary)] hover:opacity-90"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <AppearancePreview
        storeName={vendor.name}
        logo={logo}
        banner={banner}
        accentColor={accentColor}
      />

      <AppearancePreview
        storeName={vendor.name}
        logo={logo}
        banner={banner}
        accentColor={accentColor}
        productCount={vendor._count.products}
        followerCount={vendor._count.storeFollow}
        rating={vendor.averageRating ?? 0}
      />
    </div>
  );
}
