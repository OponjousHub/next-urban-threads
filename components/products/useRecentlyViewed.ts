import { useEffect } from "react";
import { useTenant } from "@/store/tenant-provider-context";

export function useRecentlyViewed(product: any) {
  const { tenant } = useTenant();

  useEffect(() => {
    if (!product?.id || !tenant?.id) return;

    // Don't save deleted products
    if (product.deletedAt) return;

    const storageKey = `recent:${tenant.id}`;

    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");

      const filtered = stored.filter(
        (p: any) => p.id !== product.id && !p.deletedAt,
      );

      filtered.unshift(product);

      localStorage.setItem(storageKey, JSON.stringify(filtered.slice(0, 12)));
    } catch (error) {
      console.error("Failed to save recently viewed products:", error);
    }
  }, [product, tenant?.id]);
}
