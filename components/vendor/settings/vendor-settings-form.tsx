"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Vendor = {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;

  logo: string | null;
  banner: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  storeSlug: string | null;
};

type Props = {
  vendor: Vendor;
};

export default function VendorSettingsForm({ vendor }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: vendor.name,
    description: vendor.description || "",

    email: vendor.email || "",
    phone: vendor.phone || "",

    logo: vendor.logo || "",
    banner: vendor.banner || "",

    address: vendor.address || "",
    city: vendor.city || "",
    state: vendor.state || "",
    country: vendor.country || "",

    storeSlug: vendor.storeSlug || "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function save() {
    setLoading(true);

    try {
      const res = await fetch("/api/vendor/settings", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Store profile updated");

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Branding */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Store Branding</h2>

        <p className="mb-6 text-sm text-gray-500">
          Customers will see these images.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Logo URL</label>

            <input
              value={form.logo}
              onChange={(e) => update("logo", e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Banner URL</label>

            <input
              value={form.banner}
              onChange={(e) => update("banner", e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>
        </div>
      </div>

      {/* Business */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold">Business Information</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Business Name"
            className="rounded-lg border p-3"
          />

          <input
            value={form.storeSlug}
            onChange={(e) => update("storeSlug", e.target.value)}
            placeholder="Store Slug"
            className="rounded-lg border p-3"
          />

          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Email"
            className="rounded-lg border p-3"
          />

          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="Phone"
            className="rounded-lg border p-3"
          />

          <input
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            placeholder="Country"
            className="rounded-lg border p-3"
          />

          <input
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            placeholder="State"
            className="rounded-lg border p-3"
          />

          <input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="City"
            className="rounded-lg border p-3"
          />

          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Address"
            className="rounded-lg border p-3"
          />
        </div>
      </div>

      {/* Description */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">About Store</h2>

        <textarea
          rows={6}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Tell customers about your business..."
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
