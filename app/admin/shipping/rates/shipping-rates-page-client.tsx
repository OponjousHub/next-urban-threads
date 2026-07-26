"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useTenant } from "@/store/tenant-provider-context";

type ShippingRate = {
  id: string;
  name: string;
  amount: number | string;
  priority: number;
  active: boolean;
  isDefault: boolean;

  minOrderAmount: number | string | null;
  maxOrderAmount: number | string | null;

  minWeight: number | null;
  maxWeight: number | null;

  zone: {
    id: string;
    name: string;
  };

  method: {
    id: string;
    name: string;
  };
};

type Props = {
  rates: ShippingRate[];
};

export default function ShippingRatesPageClient({ rates }: Props) {
  const [search, setSearch] = useState("");
  const { tenant } = useTenant();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return rates.filter((rate) => {
      return (
        rate.name.toLowerCase().includes(q) ||
        rate.zone.name.toLowerCase().includes(q) ||
        rate.method.name.toLowerCase().includes(q)
      );
    });
  }, [rates, search]);

  async function deleteRate(id: string) {
    if (!confirm("Delete this shipping rate?")) return;

    const res = await fetch(`/api/admin/shipping/rates/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      location.reload();
    } else {
      const data = await res.json();
      alert(data.message ?? "Unable to delete.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping Rates</h1>

          <p className="mt-2 text-sm text-gray-500">
            Configure shipping prices and conditions.
          </p>
        </div>

        <Link
          href="/admin/shipping/rates/new"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          New Rate
        </Link>
      </div>

      {/* Search */}

      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rates..."
          className="w-full rounded-xl border py-3 pl-11 pr-4"
        />
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-left">Name</th>

              <th className="px-5 py-4 text-left">Zone</th>

              <th className="px-5 py-4 text-left">Method</th>

              <th className="px-5 py-4 text-left">Price</th>

              <th className="px-5 py-4 text-left">Conditions</th>

              <th className="px-5 py-4 text-center">Priority</th>

              <th className="px-5 py-4 text-center">Status</th>

              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-500">
                  No shipping rates found.
                </td>
              </tr>
            )}

            {filtered.map((rate) => (
              <tr key={rate.id} className="border-t">
                <td className="px-5 py-4">
                  <div className="font-medium">{rate.name}</div>

                  {rate.isDefault && (
                    <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      Default
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">{rate.zone.name}</td>

                <td className="px-5 py-4">{rate.method.name}</td>

                <td className="px-5 py-4 font-medium">
                  {tenant.currency}
                  {Number(rate.amount).toLocaleString()}
                </td>

                <td className="px-5 py-4">
                  <div className="space-y-1 text-xs text-gray-600">
                    {(rate.minOrderAmount !== null ||
                      rate.maxOrderAmount !== null) && (
                      <div>
                        Order: ₦{rate.minOrderAmount ?? 0}
                        {" - "}₦{rate.maxOrderAmount ?? "∞"}
                      </div>
                    )}

                    {(rate.minWeight !== null || rate.maxWeight !== null) && (
                      <div>
                        Weight: {rate.minWeight ?? 0}
                        kg - {rate.maxWeight ?? "∞"}
                        kg
                      </div>
                    )}

                    {rate.minOrderAmount === null &&
                      rate.maxOrderAmount === null &&
                      rate.minWeight === null &&
                      rate.maxWeight === null && (
                        <span className="text-gray-400">Always applies</span>
                      )}
                  </div>
                </td>

                <td className="px-5 py-4 text-center">{rate.priority}</td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      rate.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {rate.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/shipping/rates/${rate.id}/edit`}
                      className="rounded-lg border p-2 hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => deleteRate(rate.id)}
                      className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
