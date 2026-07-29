import "@/app/globals.css";
import { redirect } from "next/navigation";
import { getAuthPayload } from "@/lib/server/auth";
import AdminLayout from "@/components/admin/adminLayout";
import { AdminSidebarProvider } from "@/store/admin-sidebar-context";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }
  return (
    <AdminSidebarProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminSidebarProvider>
  );
}
