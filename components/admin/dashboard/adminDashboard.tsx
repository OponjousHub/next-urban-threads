"use client";

import DashboardKpis from "@/components/admin/dashboard/dashboardKpis";
import DashboardAnalytics from "./dashboardAnalytics";
import DashboardOrders from "./dashboardOrders";
import DashboardInventory from "./dashboardInventory";
import DashboardSalesByCategory from "./dashboardSalesByCategory";
import CustomerInsights from "@/components/admin/dashboard/customerInsights";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back. Here's what's happening in Urban Threads.
        </p>
      </div>

      <DashboardKpis />

      <DashboardAnalytics />
      <DashboardSalesByCategory />

      <DashboardOrders />

      <DashboardInventory />
      <div className="grid grid-cols-1 lg:grid-cols-2 ">
        <CustomerInsights />
      </div>
    </div>
  );
}
