import LowStockProducts from "./lowStockProducts";

export default function DashboardInventory() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="xl:col-span-2">
        <LowStockProducts />
      </div>
    </section>
  );
}
