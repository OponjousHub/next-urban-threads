import { FiShoppingCart, FiEye } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { ProductRating } from "@/utils/product-rating";
import { useTenant } from "@/store/tenant-provider-context";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types/product";

type Props = {
  product: Product;
  imageUrl: string;
  setSelectedProduct: (product: Product) => void;
};

export default function ProductCard({
  product,
  imageUrl,
  setSelectedProduct,
}: Props) {
  const searchParams = useSearchParams();

  const { tenant } = useTenant();

  const isMultiVendor = tenant.storeMode === "MULTI_VENDOR";

  const flash = searchParams.get("flash");

  return (
    <div
      key={product.id}
      className="group bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300"
    >
      {/* IMAGE */}
      <div className="relative w-full h-56 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* HOVER ACTIONS */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => setSelectedProduct(product)}
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
            aria-label="Quick View"
          >
            <FiEye size={16} />
          </button>
        </div>

        {/* BADGE */}
        {flash === "true" && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow">
            Sale
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {product.category?.name}
        </span>

        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[var(--color-primary)] transition">
          {product.name}
        </h3>

        {/* ONLY FOR MULTI-VENDOR */}

        {/* ONLY FOR MULTI-VENDOR */}
        {isMultiVendor && product.vendor && (
          <Link
            href={`/stores/${product.vendor.slug}`}
            className="inline-flex items-center gap-1.5 w-fit text-xs text-gray-500 hover:text-[var(--color-primary)] transition-colors group/store"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-gray-400 group-hover/store:text-[var(--color-primary)] transition-colors"
            >
              <path d="M3 9.75A2.75 2.75 0 0 1 5.75 7h12.5A2.75 2.75 0 0 1 21 9.75V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.75Zm3.25-4.25h11.5l.75 1.5H5.5l.75-1.5Z" />
            </svg>

            <span>Sold by</span>

            <span className="font-semibold underline-offset-2 group-hover/store:underline">
              {product.vendor.name}
            </span>
          </Link>
        )}

        <ProductRating
          rating={product.averageRating}
          count={product.reviewCount}
        />

        <div className="flex items-center justify-between mt-1">
          <p className="text-lg font-bold text-[var(--color-primary)]">
            {tenant.currency}

            {product.price.toLocaleString()}
          </p>
        </div>

        <Link href={`/products/details/${product.id}`}>
          <button className="mt-3 w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2">
            <FiShoppingCart size={14} />
            View Product
          </button>
        </Link>
      </div>
    </div>
  );
}
