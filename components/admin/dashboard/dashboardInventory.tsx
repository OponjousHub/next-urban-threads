import ActivityFeed from "./activityFeed";
import CustomerInsights from "./customerInsights";

export default function DashboardInventory({
  totalCustomer,
  newCustomer,
}: {
  totalCustomer: number;
  newCustomer: number;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="grid grid-cols-1 lg:grid-cols-2h-full">
        <ActivityFeed />
      </div>
      <div className="I ">
        <CustomerInsights
          totalCustomer={totalCustomer}
          newCustomer={newCustomer}
        />
      </div>
    </section>
  );
}
