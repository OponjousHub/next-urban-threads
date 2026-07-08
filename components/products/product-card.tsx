import { FiShoppingCart, FiEye } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { ProductRating } from "@/utils/product-rating";
import { useTenant } from "@/store/tenant-provider-context";
import { useSearchParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  discountedPrice: number;
  createdAt: Date;
  category: Category;
  vendor?: {
    id: string;
    storeName: string;
  };
};

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

  const isSingleVendor = tenant.storeMode === "SINGLE_VENDOR";

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

        {isMultiVendor && product.vendor && (
          <p className="text-xs text-gray-500">
            Sold by{" "}
            <span className="font-medium">{product.vendor.storeName}</span>
          </p>
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
