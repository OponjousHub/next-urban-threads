"use client";

import Row from "./row";
import { useState } from "react";
import { ConfirmDeleteModal } from "@/app/admin/confirmDeleteModal";
import { appToast } from "@/utils/appToast";
import { useRouter } from "next/navigation";
export default function ProductsTable({
  products,
  query,
}: {
  products: any[];
  query?: string;
}) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      setDeleting(true);

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

      setShowDeleteModal(false);
      router.refresh(); // 🔥 important
    } catch (err) {
      appToast.error("Delete failed", "Network error. Try again.");
    } finally {
      setDeleting(false);
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
                onDeleteClick={(product) => {
                  setSelectedProduct(product);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        loadingText="Deleting..."
        action="Delete Product"
      />
    </>
  );
}
