import { useEffect } from "react";

export function useRecentlyViewed(product: any) {
  useEffect(() => {
    if (!product) return;

    const stored = JSON.parse(localStorage.getItem("recent") || "[]");

    const updated = [
      product,
      ...stored.filter((p: any) => p.id !== product.id),
    ].slice(0, 6);

    localStorage.setItem("recent", JSON.stringify(updated));
  }, [product]);
}
