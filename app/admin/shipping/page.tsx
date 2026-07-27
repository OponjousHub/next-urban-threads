import Link from "next/link";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import {
  MapPinned,
  Truck,
  BadgeDollarSign,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function ShippingDashboardPage() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const [
    zoneCount,
    methodCount,
    rateCount,
    activeRateCount,
    recentZones,
    recentMethods,
    recentRates,
  ] = await Promise.all([
    prisma.shippingZone.count({
      where: {
        tenantId: tenant.id,
      },
    }),

    prisma.shippingMethod.count({
      where: {
        tenantId: tenant.id,
      },
    }),

    prisma.shippingRate.count({
      where: {
        tenantId: tenant.id,
      },
    }),

    prisma.shippingRate.count({
      where: {
        tenantId: tenant.id,
        active: true,
      },
    }),

    prisma.shippingZone.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.shippingMethod.findMany({
      where: {
        tenantId: tenant.id,
      },
      include: {
        zone: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.shippingRate.findMany({
      where: {
        tenantId: tenant.id,
      },
      include: {
        method: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping</h1>

          <p className="mt-2 text-muted-foreground">
            Manage shipping zones, methods and delivery pricing.
          </p>
        </div>

        <Link
          href="/admin/shipping/rates/new"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Shipping Rate
        </Link>
      </div>

      {/* KPI Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Shipping Zones</p>

              <h2 className="mt-2 text-3xl font-bold">{zoneCount}</h2>
            </div>

            <MapPinned className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Shipping Methods</p>

              <h2 className="mt-2 text-3xl font-bold">{methodCount}</h2>
            </div>

            <Truck className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Shipping Rates</p>

              <h2 className="mt-2 text-3xl font-bold">{rateCount}</h2>
            </div>

            <BadgeDollarSign className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Rates</p>

              <h2 className="mt-2 text-3xl font-bold">{activeRateCount}</h2>
            </div>

            <BadgeDollarSign className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}

      <div className="grid gap-6 lg:grid-cols-3">
        <Link
          href="/admin/shipping/zones"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Shipping Zones</h3>

              <p className="mt-2 text-sm text-gray-500">
                Create and manage delivery regions.
              </p>
            </div>

            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>

        <Link
          href="/admin/shipping/methods"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Shipping Methods</h3>

              <p className="mt-2 text-sm text-gray-500">
                Configure standard, express and pickup.
              </p>
            </div>

            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>

        <Link
          href="/admin/shipping/rates"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Shipping Rates</h3>

              <p className="mt-2 text-sm text-gray-500">
                Configure delivery pricing rules.
              </p>
            </div>

            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Zones */}

        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">Recent Zones</h2>
          </div>

          <div>
            {recentZones.length ? (
              recentZones.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between border-b p-4 last:border-0"
                >
                  <span>{zone.name}</span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      zone.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {zone.active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No shipping zones
              </div>
            )}
          </div>
        </div>

        {/* Methods */}

        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">Recent Methods</h2>
          </div>

          <div>
            {recentMethods.length ? (
              recentMethods.map((method) => (
                <div key={method.id} className="border-b p-4 last:border-0">
                  <p className="font-medium">{method.name}</p>

                  <p className="text-sm text-gray-500">{method.zone.name}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No shipping methods
              </div>
            )}
          </div>
        </div>

        {/* Rates */}

        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">Recent Rates</h2>
          </div>

          <div>
            {recentRates.length ? (
              recentRates.map((rate) => (
                <div key={rate.id} className="border-b p-4 last:border-0">
                  <p className="font-medium">{rate.name}</p>

                  <p className="text-sm text-gray-500">{rate.method.name}</p>

                  <p className="mt-1 font-semibold">
                    {tenant.currency}
                    {rate.amount.toNumber().toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No shipping rates
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
