"use client";

import Row from "./row";
import { useState } from "react";
import ConfirmationModal from "../modals/ConfirmationModal";
import { appToast } from "@/utils/appToast";
import { useRouter } from "next/navigation";

export default function ProductsTable({
  products,
  query,
  basePath,
}: {
  products: any[];
  query?: string;
  basePath: string;
}) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!products.length) {
    return (
      <div className="bg-white rounded-xl p-10 text-center text-gray-500">
        No products found
      </div>
    );
  }

  async function handleDelete() {
    if (!selectedProduct) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        appToast.error(
          "Delete failed",
          `${data?.message || "Something went wrong"}`,
        );

        return;
      }
      appToast.success(
        "Product deleted",
        "The product has been removed successfully",
      );

      setOpen(false);
      router.refresh(); // 🔥 important
    } catch (err) {
      appToast.error("Delete failed", "Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left text-lg p-4">Product</th>
              <th className="text-left text-lg">Price</th>
              <th className="text-left text-lg">Stock</th>
              <th className="text-right text-lg pr-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <Row
                key={product.id}
                product={product}
                query={query}
                basePath={basePath}
                onDeleteClick={(product) => {
                  setSelectedProduct(product);
                  setOpen(true);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        loadingText="Deleting..."
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        action="Delete Product"
        variant="danger"
      />
    </>
  );
}
