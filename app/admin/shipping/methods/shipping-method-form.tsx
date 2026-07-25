"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";

type Zone = {
  id: string;
  name: string;
};

type ShippingMethod = {
  id: string;
  zoneId: string;
  name: string;
  description: string | null;
  estimatedMinDays: number | null;
  estimatedMaxDays: number | null;
  active: boolean;
};

type Props = {
  zones: Zone[];
  initialData?: ShippingMethod;
};

export default function ShippingMethodForm({ zones, initialData }: Props) {
  const router = useRouter();

  const editing = !!initialData;

  const [zoneId, setZoneId] = useState(initialData?.zoneId ?? "");

  const [name, setName] = useState(initialData?.name ?? "");

  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );

  const [estimatedMinDays, setEstimatedMinDays] = useState(
    initialData?.estimatedMinDays?.toString() ?? "",
  );

  const [estimatedMaxDays, setEstimatedMaxDays] = useState(
    initialData?.estimatedMaxDays?.toString() ?? "",
  );

  const [active, setActive] = useState(initialData?.active ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!zoneId) {
      setError("Please select a shipping zone.");
      return;
    }

    if (!name.trim()) {
      setError("Method name is required.");
      return;
    }

    const min = estimatedMinDays === "" ? null : Number(estimatedMinDays);

    const max = estimatedMaxDays === "" ? null : Number(estimatedMaxDays);

    if (min !== null && max !== null && min > max) {
      setError("Minimum delivery days cannot exceed maximum delivery days.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        editing
          ? `/api/admin/shipping/methods/${initialData.id}`
          : "/api/admin/shipping/methods",
        {
          method: editing ? "PATCH" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            zoneId,
            name,
            description,
            estimatedMinDays: min,
            estimatedMaxDays: max,
            active,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message ?? "Unable to save shipping method.");
      }

      router.push("/admin/shipping/methods");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">Shipping Method</h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure how customers receive their orders.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Shipping Zone
            </label>

            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select a shipping zone</option>

              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Method Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Standard Delivery"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Minimum Delivery Days
              </label>

              <input
                type="number"
                min={0}
                value={estimatedMinDays}
                onChange={(e) => setEstimatedMinDays(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Maximum Delivery Days
              </label>

              <input
                type="number"
                min={0}
                value={estimatedMaxDays}
                onChange={(e) => setEstimatedMaxDays(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <h3 className="font-medium">Active</h3>

              <p className="text-sm text-gray-500">
                Customers can choose this shipping method.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative h-7 w-14 rounded-full transition ${
                active ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  active ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/shipping/methods"
          className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-medium hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>

        <button
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {editing ? "Update Method" : "Create Method"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
