"use client";

import { useEffect, useState } from "react";
import DashboardKpis from "@/components/admin/dashboard/dashboardKpis";
import DashboardAnalytics from "../../../components/admin/dashboard/dashboardAnalytics";
import DashboardOrders from "../../../components/admin/dashboard/dashboardOrders";
import DashboardInventory from "../../../components/admin/dashboard/dashboardInventory";
import DashboardSalesByCategory from "../../../components/admin/dashboard/dashboardSalesByCategory";

type RecentOrder = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: string;
  date: string;
};

type DashboardProduct = {
  id: string;
  name: string;
  revenue: number;
  sales: number;
  image: string;
};

type OrderStatusStats = {
  pending: {
    count: number;
    revenue: number;
  };
  processing: {
    count: number;
    revenue: number;
  };
  shipped: {
    count: number;
    revenue: number;
  };
  delivered: {
    count: number;
    revenue: number;
  };
  cancelled: {
    count: number;
    revenue: number;
  };
};

type DashboardData = {
  storeMode: string;
  currency: string;
  timezone: string;

  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCustomers: number;
    newCustomersToday: number;
  };

  lowStock: {
    id: string;
    name: string;
    stock: number;
  }[];

  orderStatus: OrderStatusStats;

  salesByCategory: {
    category: string;
    sales: number;
  }[];

  formattedRecentOrders: RecentOrder[];
  topProducts: DashboardProduct[];
  activities: any[];
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    storeMode: "SINGLE_VENDOR",
    currency: "NGN",
    timezone: "UTC",

    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalCustomers: 0,
      newCustomersToday: 0,
    },

    lowStock: [],

    orderStatus: {
      pending: { count: 0, revenue: 0 },
      processing: { count: 0, revenue: 0 },
      shipped: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
      cancelled: { count: 0, revenue: 0 },
    },

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
    // 237,678.87
    loadDashboard();
  }, []);
  console.log("DASHBOARD API SUMMARY", data.summary);
  console.log("DASHBOARD API TOTAL REVENUE", data.summary?.totalRevenue);

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-[var(--color-primary-light)] animate-pulse z-50" />
      )}

      <div className="space-y-8">
        {/* Header */}

        <DashboardKpis
          totalRevenue={data.summary.totalRevenue}
          totalCustomer={data.summary.totalCustomers}
          totalOrder={data.summary.totalOrders}
          conversion={0}
          returningCustomerRate={0}
        />

        <DashboardAnalytics
          lowstock={data?.lowStock}
          orderStatus={data?.orderStatus}
          newCustomers={data?.summary.newCustomersToday}
        />

        <DashboardSalesByCategory
          orderStatus={data?.orderStatus}
          catData={data?.salesByCategory}
          currency={data?.currency}
        />

        <DashboardOrders
          recentOrders={data?.formattedRecentOrders}
          products={data?.topProducts}
          currency={data?.currency}
        />

        <DashboardInventory
          totalCustomer={data.summary.totalCustomers}
          newCustomer={data.summary.newCustomersToday}
          activities={data.activities}
        />
      </div>
    </>
  );
}
