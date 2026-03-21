import Header from "@/components/admin/products/header";
import ProductsTable from "@/components/admin/products/product-table";

export default async function ProductsPage() {
  //   const [loading, setLoading] = useState(true);

  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <div className="space-y-6">
      <Header />
      <ProductsTable products={data.products || []} />
    </div>
  );
}
