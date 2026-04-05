import ActivityFeed from "./activityFeed";
import CustomerInsights from "./customerInsights";

interface Activity {
  id: string;
  type: "order" | "user" | "stock";
  message: string;
  time: Date;
}

interface Props {
  activities: Activity[];
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
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="grid grid-cols-1 lg:grid-cols-2h-full">
        <ActivityFeed activities={activities} />
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
