"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Globe, MapPin, Plus, Search, Settings, Truck } from "lucide-react";

type ShippingZone = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  methodCount: number;
  rateCount: number;
  createdAt: Date;
};

type Props = {
  zones: ShippingZone[];
};

export default function ShippingZonesPageClient({ zones }: Props) {
  const [search, setSearch] = useState("");

  const filteredZones = useMemo(() => {
    if (!search.trim()) return zones;

    return zones.filter((zone) => {
      const keyword = search.toLowerCase();

      return (
        zone.name.toLowerCase().includes(keyword) ||
        zone.description?.toLowerCase().includes(keyword)
      );
    });
  }, [search, zones]);

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between rounded-2xl border bg-white p-4 shadow-sm">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipping zones..."
            className="w-full rounded-xl border pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <Link
          href="/admin/shipping/zones/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          New Zone
        </Link>
      </div>

      {/* Empty State */}

      {filteredZones.length === 0 && (
        <div className="rounded-2xl border bg-white py-20 text-center shadow-sm">
          <Globe className="mx-auto h-14 w-14 text-gray-300" />

          <h2 className="mt-4 text-lg font-semibold">No Shipping Zones</h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first shipping zone to begin configuring delivery.
          </p>

          <Link
            href="/admin/shipping/zones/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Create Zone
          </Link>
        </div>
      )}

      {/* Table */}

      {filteredZones.length > 0 && (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm">
              <tr>
                <th className="px-6 py-4">Zone</th>

                <th className="px-6 py-4">Status</th>

                <th className="px-6 py-4">Methods</th>

                <th className="px-6 py-4">Rates</th>

                <th className="px-6 py-4">Created</th>

                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredZones.map((zone) => (
                <tr key={zone.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>

                      <div>
                        <p className="font-medium">{zone.name}</p>

                        {zone.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {zone.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        zone.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {zone.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      {zone.methodCount}
                    </div>
                  </td>

                  <td className="px-6 py-5">{zone.rateCount}</td>

                  <td className="px-6 py-5 text-sm text-gray-500">
                    {new Date(zone.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/admin/shipping/zones/${zone.id}/edit`}
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
