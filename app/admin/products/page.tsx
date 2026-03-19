"use client";

import { mockProducts } from "@/mock/products";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <Header />
      <ProductsTable products={mockProducts} />
    </div>
  );
}
