import VendorSidebar from "@/components/vendor/vendorSidebar";
import { getAuthPayload } from "@/lib/server/auth";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { VendorSidebarProvider } from "@/store/vendor-sidebar-context";
import { redirect } from "next/navigation";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthPayload();
  const { vendor } = await getCurrentVendor();

  if (!auth.userId) {
    redirect("/login");
  }

  if (auth.role !== "Vendor") {
    redirect("/");
  }

  if (vendor?.status === "SUSPENDED") {
    redirect("/");
  }

  return (
    <VendorSidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <VendorSidebar vendor={vendor} />

        <div className="flex flex-1 flex-col mb-6">{children}</div>
      </div>
    </VendorSidebarProvider>
  );
}
