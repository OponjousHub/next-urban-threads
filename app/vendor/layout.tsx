import VendorSidebar from "@/components/vendor/vendorSidebar";
import { getAuthPayload } from "@/lib/server/auth";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { prisma } from "@/utils/prisma";
import { redirect } from "next/navigation";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthPayload();

  if (!auth.userId) {
    redirect("/login");
  }

  if (auth.role !== "Vendor") {
    redirect("/");
  }

  const { vendorId } = await getCurrentVendor();

  const vendor = await prisma.vendor.findUnique({
    where: {
      id: vendorId,
    },
  });

  if (vendor?.status === "SUSPENDED") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VendorSidebar />

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
