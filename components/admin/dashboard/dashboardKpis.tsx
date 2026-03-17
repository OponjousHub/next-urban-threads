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
  const [kpiData, setKPIData] = useState<any>(null);

  // Fetch Kpi percentage change
  useEffect(() => {
    async function loadKpiChange() {
      const res = await fetch("/api/admin/revenue");
      const json = await res.json();
      setKPIData(json);
    }

    loadKpiChange();
  }, []);
  console.log("KPIKPIKPI", kpiData);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <KpiCard
        title="Total Revenue"
        value={kpiData?.revenue}
        prefix="$"
        change={kpiData?.revenueChange}
        icon={<FiDollarSign />}
      />

      <KpiCard
        title="Average Order Value"
        value={
          kpiData?.avgOrderValue
          // > 0
          //   ? kpiData?.revenue / kpiData?.avgOrderValue
          //   : 0
        }
        prefix="$"
        decimals={2}
        icon={<FiBarChart2 />}
        change={kpiData?.avgOrderValue}
      />

      <KpiCard
        title="Total Orders"
        value={kpiData?.orders}
        icon={<FiShoppingBag />}
        change={kpiData?.ordersChange}
      />

      <KpiCard
        title="Customers"
        value={kpiData?.customers}
        icon={<FiUsers />}
        change={kpiData?.customersChange}
      />
      <KpiCard
        title="Conversion Rate"
        value={kpiData?.conversionRate}
        suffix="%"
        change={kpiData?.conversionChange}
        decimals={1}
        icon={<FiTrendingUp />}
      />
      <KpiCard
        title="Returning Customers"
        value={kpiData?.returningCustomerRate}
        suffix="%"
        decimals={1}
        icon={<FiRepeat />}
        change={kpiData?.returningCustomerChange}
      />
    </section>
  );
}
