"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function VendorProductsPage({ vendorId }: { vendorId: string }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch(`/api/admin/vendors/manage/${vendorId}/products`);

    const data = await res.json();

    setProducts(data.data);
  }
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Link
        href={`/admin/vendors/manage/${vendorId}`}
        className="inline-flex items-center gap-2 mb-6"
      >
        <FaArrowLeft size={12} />
        Back to Vendor
      </Link>

      <h1 className="text-3xl font-bold mb-6">Vendor Products</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Product</th>

              <th className="p-4 text-left">Category</th>

              <th className="p-4 text-left">Price</th>

              <th className="p-4 text-left">Stock</th>

              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product: any) => (
              <tr key={product.id} className="border-t">
                <td className="p-4">{product.name}</td>

                <td className="p-4">{product.category?.name}</td>

                <td className="p-4">₦{product.price}</td>

                <td className="p-4">{product.stock}</td>

                <td className="p-4">
                  {product.stock === 0 ? (
                    <span className="text-red-600">Out of Stock</span>
                  ) : product.stock <= 5 ? (
                    <span className="text-amber-600">Low Stock</span>
                  ) : (
                    <span className="text-green-600">In Stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
