import LowStockProducts from "./lowStockProducts";
import ActivityFeed from "./activityFeed";

export default function DashboardInventory() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="h-full">
        <LowStockProducts />
      </div>
      <div className="h-full">
        <ActivityFeed />
      </div>
    </section>
  );
}
