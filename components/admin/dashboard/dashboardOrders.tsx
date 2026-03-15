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

export default function DashboardAnalytics({
  recentOders,
}: {
  recentOders: recentOders[];
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="h-full">
        <RecentOrdersTable orders={recentOders} />
      </div>
      <div className="h-full">
        <TopProducts />
      </div>
    </section>
  );
}
