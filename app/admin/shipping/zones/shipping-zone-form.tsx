"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { appToast } from "@/utils/appToast";
import { Country, State } from "country-state-city";

type ShippingZone = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  countries: string[];
  states: string[];
};

type Props = {
  initialData?: ShippingZone;
};

export default function ShippingZoneForm({ initialData }: Props) {
  const router = useRouter();
  const editing = !!initialData;
  const countries = Country.getAllCountries();

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [active, setActive] = useState(initialData?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countryCode, setCountryCode] = useState(
    initialData?.countries?.[0] ?? "",
  );
  const states = countryCode ? State.getStatesOfCountry(countryCode) : [];

  const [selectedStates, setSelectedStates] = useState<string[]>(
    initialData?.states ?? [],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Zone name is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        editing
          ? `/api/admin/shipping/zones/${initialData.id}`
          : "/api/admin/shipping/zones",
        {
          method: editing ? "PATCH" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            description,
            countries: [countryCode],
            states: selectedStates,
            active,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message ?? "Unable to save shipping zone.");
      }

      appToast.success(
        "Success",
        editing
          ? "Shipping zone updated successfully."
          : "Shipping zone created successfully.",
      );

      router.push("/admin/shipping/zones");

      router.refresh();
    } catch (err: any) {
      setError(err.message);
      appToast.error("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">Zone Information</h2>

          <p className="mt-1 text-sm text-gray-500">
            Define a shipping destination group.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Zone Name</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lagos"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select Country</option>

              {countries.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              {states.map((state) => (
                <label key={state.isoCode} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStates((prev) => [...prev, state.name]);
                      } else {
                        setSelectedStates((prev) =>
                          prev.filter((s) => s !== state.name),
                        );
                      }
                    }}
                  />

                  {state.name}
                </label>
              ))}
            </div>
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

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <h3 className="font-medium">Active</h3>

              <p className="text-sm text-gray-500">
                Customers can use this shipping zone.
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
          href="/admin/shipping/zones"
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
              {editing ? "Update Zone" : "Create Zone"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
