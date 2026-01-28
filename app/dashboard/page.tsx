import { getUserDashboardStats } from "@/app/lib/dashboard";
import AuthController from "@/modules/auth/auth.controller";
import { cookies } from "next/headers";
import DashboardClient from "./dashboardClient";
import { getLoggedInUserId } from "@/lib/auth";

export default async function UserDashboard() {
  const userId = await getLoggedInUserId();
  // const cookieStore = await cookies();
  // const token = cookieStore.get("token")?.value;
  // const userId = token && AuthController.getUserIdFromToken(token);
  console.log("UUUSSSSEEEERRRRiiiDDD", userId);

  if (!userId) {
    return console.log("nnnuuuuuuulllll!!!"); // or redirect
  }

  const stats = await getUserDashboardStats(userId);

  return <DashboardClient stats={stats} />;
}
