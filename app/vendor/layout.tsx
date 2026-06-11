import VendorSidebar from "@/components/vendor/vendorSidebar";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <VendorSidebar />

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
