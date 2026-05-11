import { useEffect } from "react";

export function useRecentlyViewed(product: any) {
  useEffect(() => {
    if (!product?.id) return;

    // 🚫 don't save deleted products
    if (product.deletedAt) return;

    const stored = JSON.parse(localStorage.getItem("recent") || "[]");

    const filtered = stored.filter(
      (p: any) => p.id !== product.id && !p.deletedAt,
    );

    filtered.unshift(product);

    localStorage.setItem("recent", JSON.stringify(filtered.slice(0, 12)));
  }, [product]);
}
