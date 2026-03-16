"use client";

import { useEffect, useState } from "react";
import DashboardKpis from "@/components/admin/dashboard/dashboardKpis";
import DashboardAnalytics from "./dashboardAnalytics";
import DashboardOrders from "./dashboardOrders";
import DashboardInventory from "./dashboardInventory";
import DashboardSalesByCategory from "./dashboardSalesByCategory";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      setData(json);
    }

    loadDashboard();
  }, []);

  if (!data) return <p>Loading dashboard...</p>;
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back. Here's what's happening in Urban Threads.
        </p>
      </div>

      <DashboardKpis
        totalRevenue={data.revenue}
        totalCustomer={data.totalCustomers}
        totalOrder={data.totalOrders}
        conversion={data.conversionRate}
        returningCustomerRate={data.returningCustomerRate}
      />

      <DashboardAnalytics
        lowstock={data.lowStock}
        orderStatus={data.orderStatus}
        newCustomers={data.newCustomersToday}
      />
      <DashboardSalesByCategory
        orderStatus={data.orderStatus}
        catData={data.salesByCategory}
      />

      <DashboardOrders
        recentOders={data.formattedRecentOrders}
        products={data.topProducts}
      />

      <DashboardInventory
        totalCustomer={data.totalCustomers}
        newCustomer={data.newCustomersToday}
        activities={data.activities}
      />
    </div>
  );
}
