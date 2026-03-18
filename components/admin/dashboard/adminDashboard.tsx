"use client";

import { useEffect, useState } from "react";
import DashboardKpis from "@/components/admin/dashboard/dashboardKpis";
import DashboardAnalytics from "./dashboardAnalytics";
import DashboardOrders from "./dashboardOrders";
import DashboardInventory from "./dashboardInventory";
import DashboardSalesByCategory from "./dashboardSalesByCategory";

export default function AdminDashboard() {
  // const [data, setData] = useState<any>(null);
  const [data, setData] = useState({
    revenue: 0,
    totalCustomers: 0,
    totalOrders: 0,
    conversionRate: 0,
    returningCustomerRate: 0,
    lowStock: [],
    orderStatus: {
      paid: { count: 0, revenue: 0 },
      pending: { count: 0, revenue: 0 },
      cancelled: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
    },
    newCustomersToday: 0,
    salesByCategory: [],
    formattedRecentOrders: [],
    topProducts: [],
    activities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      setData(json);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-50" />
      )}

      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back. Here's what's happening in Urban Threads.
          </p>
        </div>

        <DashboardKpis
          totalRevenue={data?.revenue}
          totalCustomer={data?.totalCustomers}
          totalOrder={data?.totalOrders}
          conversion={data?.conversionRate}
          returningCustomerRate={data?.returningCustomerRate}
        />

        <DashboardAnalytics
          lowstock={data?.lowStock}
          orderStatus={data?.orderStatus}
          newCustomers={data?.newCustomersToday}
        />

        <DashboardSalesByCategory
          orderStatus={data?.orderStatus}
          catData={data?.salesByCategory}
        />

        <DashboardOrders
          recentOders={data?.formattedRecentOrders}
          products={data?.topProducts}
        />

        <DashboardInventory
          totalCustomer={data?.totalCustomers}
          newCustomer={data?.newCustomersToday}
          activities={data?.activities}
        />
      </div>
    </>
  );
}
