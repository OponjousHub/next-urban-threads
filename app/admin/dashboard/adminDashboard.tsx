"use client";

import { useEffect, useState } from "react";
import DashboardKpis from "@/components/admin/dashboard/dashboardKpis";
import DashboardAnalytics from "../../../components/admin/dashboard/dashboardAnalytics";
import DashboardOrders from "../../../components/admin/dashboard/dashboardOrders";
import DashboardInventory from "../../../components/admin/dashboard/dashboardInventory";
import DashboardSalesByCategory from "../../../components/admin/dashboard/dashboardSalesByCategory";
import { useTenant } from "@/store/tenant-provider-context";

export default function AdminDashboard() {
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
    currency: "NGN",
  });
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();

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
        <div className="fixed top-0 left-0 w-full h-1 bg-[var(--color-primary-light)] animate-pulse z-50" />
      )}

      <div className="space-y-8">
        {/* Header */}

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
          currency={data?.currency}
        />

        <DashboardOrders
          recentOders={data?.formattedRecentOrders}
          products={data?.topProducts}
          currency={data?.currency}
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
