"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBox, FaShoppingBag, FaCog, FaPlus } from "react-icons/fa";
import { MetricCard } from "@/utils/vendorDashboardCard";
import { useTenant } from "@/store/tenant-provider-context";

type DashboardData = {
  revenue: number;
  orders: number;
  products: number;
  pendingOrders: number;

  recentOrders: {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];

  lowStockProducts: {
    id: string;
    name: string;
    stock: number;
    thumbnail?: string;
  }[];
};

export default function VendorDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { tenant } = useTenant();

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const response = await fetch("/api/vendor/dashboard");

      const data = await response.json();

      setDashboard(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function copyOrderId(id: string) {
    await navigator.clipboard.writeText(id);

    setCopiedId(id);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-2xl bg-gray-200" />

          <div className="h-80 rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>

        <p className="text-sm text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Revenue"
          value={`${tenant.currency}${Number(dashboard?.revenue || 0).toLocaleString()}`}
        />

        <MetricCard title="Orders" value={dashboard?.orders || 0} />

        <MetricCard title="Products" value={dashboard?.products || 0} />

        <MetricCard
          title="Pending Orders"
          value={dashboard?.pendingOrders || 0}
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">Recent Orders</h2>
          </div>

          <div>
            {dashboard?.recentOrders?.length ? (
              dashboard.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b p-4 last:border-b-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        #{order.id.slice(0, 8)}...
                      </span>

                      <button
                        onClick={() => copyOrderId(order.id)}
                        className={`text-xs transition ${
                          copiedId === order.id
                            ? "text-green-600 font-medium"
                            : "text-blue-600"
                        }`}
                      >
                        {copiedId === order.id ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {tenant.currency}
                      <span className="font-bold">
                        {Number(order.totalAmount).toLocaleString()}
                      </span>
                    </p>

                    <p className="text-xs text-muted-foreground ">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No recent orders
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold">Low Stock Products</h2>
          </div>

          <div>
            {dashboard?.lowStockProducts?.length ? (
              dashboard.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b p-4 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium
                    ${
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  `}
                  >
                    Stock: {product.stock}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No low stock products
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Quick Actions</h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/vendor/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-white transition hover:opacity-90"
          >
            <FaPlus />
            Add Product
          </Link>

          <Link
            href="/vendor/orders"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            <FaShoppingBag />
            Manage Orders
          </Link>

          <Link
            href="/vendor/settings"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            <FaCog />
            Store Settings
          </Link>

          <Link
            href="/vendor/products"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            <FaBox />
            Products
          </Link>
        </div>
      </div>
    </main>
  );
}
