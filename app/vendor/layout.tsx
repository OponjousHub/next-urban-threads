import VendorSidebar from "@/components/vendor/vendorSidebar";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const auth = await getAuthPayload();

  // if (!auth.userId) {
  //   redirect("/login");
  // }

  // if (auth.role !== "Vendor") {
  //   redirect("/");
  // }
  return (
    <div className="flex min-h-screen bg-gray-50">
      <VendorSidebar />

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
