import ActivityFeed from "./activityFeed";
import CustomerInsights from "./customerInsights";

interface Activity {
  id: string;
  type: "order" | "user" | "stock";
  message: string;
  time: Date;
}

export default function DashboardInventory({
  totalCustomer,
  newCustomer,
  activities,
}: {
  totalCustomer: number;
  newCustomer: number;
  activities: Activity[];
}) {
  console.log("DashboardInventory customers:", {
    totalCustomer,
    newCustomer,
  });
  return (
    <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
      <div className="h-full">
        <ActivityFeed activities={activities} />
      </div>

      <div className="h-full">
        <CustomerInsights
          totalCustomer={totalCustomer}
          newCustomer={newCustomer}
        />
      </div>
    </section>
  );
}
