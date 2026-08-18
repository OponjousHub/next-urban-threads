import KpiCard from "../KpiCard";
import { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiRepeat,
  FiBarChart2,
} from "react-icons/fi";

interface KpiData {
  revenue: number;
  revenueChange: number;

  orders: number;
  ordersChange: number;

  avgOrderValue: number;
  avgOrderChange: number;

  customers: number;
  customersChange: number;

  conversionRate: number | null;
  conversionChange: number | null;

  returningCustomerRate: number;
  returningCustomerChange: number;

  currency: string;
}

export default function DashboardAnalytics({
  totalRevenue,
  totalCustomer,
  totalOrder,
  conversion,
  returningCustomerRate,
}: {
  totalRevenue: number;
  totalCustomer: number;
  totalOrder: number;
  conversion: number;
  returningCustomerRate: number;
}) {
  const [kpiData, setKPIData] = useState<KpiData | null>(null);
  const [currency, setCurrency] = useState("NGN");

  // Fetch Kpi percentage change
  useEffect(() => {
    async function loadKpiChange() {
      const res = await fetch("/api/admin/revenue");
      const json = await res.json();
      setKPIData(json);
      setCurrency(json.currency || "NGN");
    }

    loadKpiChange();
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <KpiCard
        title="Total Revenue"
        value={kpiData?.revenue ?? NaN}
        currency={currency}
        change={kpiData?.revenueChange}
        icon={<FiDollarSign />}
      />

      <KpiCard
        title="Average Order Value"
        value={kpiData?.avgOrderValue ?? NaN}
        currency={currency}
        decimals={2}
        icon={<FiBarChart2 />}
        change={kpiData?.avgOrderChange}
      />

      <KpiCard
        title="Total Orders"
        value={kpiData?.orders ?? NaN}
        icon={<FiShoppingBag />}
        change={kpiData?.ordersChange}
      />

      <KpiCard
        title="Customers"
        value={kpiData?.customers ?? NaN}
        icon={<FiUsers />}
        change={kpiData?.customersChange}
      />
      <KpiCard
        title="Conversion Rate"
        value={kpiData === null ? NaN : kpiData.conversionRate}
        suffix="%"
        change={kpiData?.conversionChange}
        decimals={1}
        icon={<FiTrendingUp />}
      />
      <KpiCard
        title="Returning Customers"
        value={kpiData === null ? NaN : kpiData.returningCustomerRate}
        suffix="%"
        decimals={1}
        icon={<FiRepeat />}
        change={kpiData?.returningCustomerChange}
      />
    </section>
  );
}
