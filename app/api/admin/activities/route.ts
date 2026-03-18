import { getActivities } from "@/lib/analytics/getActivities";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const activities = await getActivities(tenant.id);
  console.log("ACTIVITIIIIEEESSSroute============", activities);

  return Response.json(activities);
}
