import { getUserDashboardStats } from "@/app/lib/dashboard";
import AuthController from "@/modules/auth/auth.controller";
import { cookies } from "next/headers";
import DashboardClient from "./dashboardClient";
import { getLoggedInUser } from "@/lib/auth";

export default async function UserDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = token ? AuthController.getUserIdFromToken(token) : null;

  if (!userId) {
    return null; // or redirect
  }
  console.log("This is the logged in user:", userId);
  const stats = await getUserDashboardStats(userId);
  const Id = await getLoggedInUser();
  console.log(Id);

  return <DashboardClient stats={stats} />;
}
