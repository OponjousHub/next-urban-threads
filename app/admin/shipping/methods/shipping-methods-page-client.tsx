"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Truck, Search, Plus, Settings, Clock, MapPin } from "lucide-react";

type ShippingMethod = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  estimatedMinDays: number | null;
  estimatedMaxDays: number | null;
  rateCount: number;
  createdAt: Date;

  zone: {
    id: string;
    name: string;
  };
};

type Props = {
  methods: ShippingMethod[];
};

export default function ShippingMethodsPageClient({ methods }: Props) {
  const [search, setSearch] = useState("");

  const filteredMethods = useMemo(() => {
    if (!search.trim()) return methods;

    const keyword = search.toLowerCase();

    return methods.filter(
      (method) =>
        method.name.toLowerCase().includes(keyword) ||
        method.zone.name.toLowerCase().includes(keyword) ||
        method.description?.toLowerCase().includes(keyword),
    );
  }, [methods, search]);

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            placeholder="Search methods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <Link
          href="/admin/shipping/methods/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-white hover:bg-neutral-800 md:ml-auto"
        >
          <Plus className="h-4 w-4" />
          New Method
        </Link>
      </div>

      {/* Search */}

      {/* <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            placeholder="Search methods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div> */}

      {/* Empty */}

      {filteredMethods.length === 0 && (
        <div className="rounded-2xl border bg-white py-20 text-center shadow-sm">
          <Truck className="mx-auto h-14 w-14 text-gray-300" />

          <h2 className="mt-4 text-lg font-semibold">No Shipping Methods</h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first shipping method.
          </p>

          <Link
            href="/admin/shipping/methods/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white"
          >
            <Plus className="h-4 w-4" />
            Create Method
          </Link>
        </div>
      )}

      {/* Table */}

      {filteredMethods.length > 0 && (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm">
              <tr>
                <th className="px-6 py-4">Method</th>

                <th className="px-6 py-4">Zone</th>

                <th className="px-6 py-4">Delivery Time</th>

                <th className="px-6 py-4">Rates</th>

                <th className="px-6 py-4">Status</th>

                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMethods.map((method) => (
                <tr key={method.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>

                      <div>
                        <p className="font-medium">{method.name}</p>

                        {method.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {method.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />

                      {method.zone.name}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />

                      {method.estimatedMinDays && method.estimatedMaxDays
                        ? `${method.estimatedMinDays} - ${method.estimatedMaxDays} days`
                        : "Not set"}
                    </div>
                  </td>

                  <td className="px-6 py-5">{method.rateCount}</td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        method.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {method.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/admin/shipping/methods/${method.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
