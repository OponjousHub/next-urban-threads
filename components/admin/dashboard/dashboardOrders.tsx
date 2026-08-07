import RecentOrdersTable from "../tables/recentOrdersTable";
import TopProducts from "@/components/admin/dashboard/topProducts";

interface recentOders {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "Paid" | "Pending" | "Cancelled";
  date: string | Date;
}

interface Product {
  id: string;
  name: string;
  revenue: number;
  sales: number;
  image: string;
}

export default function DashboardAnalytics({
  recentOders,
  products,
  currency,
}: {
  recentOders: recentOders[];
  products: Product[];
  currency: string;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="h-full">
        <RecentOrdersTable orders={recentOders} currency={currency} />
      </div>
      <div className="h-full">
        <TopProducts products={products} currency={currency} />
      </div>
    </section>
  );
}
