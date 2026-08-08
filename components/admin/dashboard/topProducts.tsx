"use client";

import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  revenue: number;
  sales: number;
  image: string;
}

interface Props {
  products: Product[];
  currency: string;
}

const currencySymbols: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  KES: "KSh",
  GHS: "GH₵",
  ZAR: "R",
};

export default function TopProducts({ products, currency }: Props) {
  const router = useRouter();
  const symbol = currencySymbols[currency] ?? currency;

  const formatAmount = (amount: number) => {
    return `${symbol}${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="group h-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-gray-900">
            Top Products
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Best performing products by sales
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)]/10"
        >
          View all
        </button>
      </div>

      {/* Products */}
      <div className="divide-y divide-gray-50">
        {products?.length > 0 ? (
          products.map((product, index) => (
            <div
              key={product.id}
              className="group/product flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-gray-50/70"
            >
              {/* Ranking */}
              <div className="flex w-6 shrink-0 justify-center">
                <span
                  className={`text-xs font-semibold ${
                    index === 0 ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Product image */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/product:scale-105"
                />
              </div>

              {/* Product information */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {product.name}
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {product.sales.toLocaleString()}{" "}
                    {product.sales === 1 ? "sale" : "sales"}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-gray-300" />

                  <span className="text-xs text-gray-400">#{index + 1}</span>
                </div>
              </div>

              {/* Revenue */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatAmount(product.revenue)}
                </p>

                <p className="mt-1 text-[11px] text-gray-400">Revenue</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
              <span className="text-lg text-gray-400">—</span>
            </div>

            <p className="text-sm font-medium text-gray-700">
              No product sales yet
            </p>

            <p className="mt-1 max-w-xs text-xs text-gray-400">
              Products will appear here once customers start placing orders.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {products?.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-3">
          <p className="text-center text-[11px] text-gray-400">
            Showing your top {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      )}
    </div>
  );
}
