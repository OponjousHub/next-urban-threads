"use client";

import { mockProducts } from "@/mock/products";
import Header from "@/components/admin/products/header";
import ProductsTable from "@/components/admin/products/product-table";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <Header />
      <ProductsTable products={mockProducts} />
    </div>
  );
}
