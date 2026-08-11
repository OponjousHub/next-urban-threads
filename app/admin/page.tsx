import AdminDashboard from "@/app/admin/dashboard/adminDashboard";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getDefaultTenant } from "../lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const tenant = await getDefaultTenant();

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };
  return (
    <>
      <AdminHeaderUI
        title={`${tenant?.storeMode === "MULTI_VENDOR" ? "Marketplace Overview." : "Dashboard Overview"}`}
        subtitle={`Here's what's happening ${tenant?.storeMode === "MULTI_VENDOR" ? "across all vendors." : "in your store"} `}
        admin={admin}
      />
      <AdminDashboard />;
    </>
  );
}
