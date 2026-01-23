import { getUserDashboardStats } from "@/app/lib/dashboard";
import AuthController from "@/modules/auth/auth.controller";
import { cookies } from "next/headers";
import DashboardClient from "./dashboardClient";

export default async function UserDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = token ? AuthController.getUserIdFromToken(token) : null;

  if (!userId) {
    return null; // or redirect
  }

  const stats = await getUserDashboardStats(userId);

  return <DashboardClient stats={stats} />;
}
