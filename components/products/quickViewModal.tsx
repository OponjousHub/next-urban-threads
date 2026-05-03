"use client";

import Image from "next/image";
import { FiX, FiShoppingCart } from "react-icons/fi";
import { ProductRating } from "@/utils/product-rating";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
};

type Props = {
  product: Product | null;
  onClose: () => void;
};

export default function QuickViewModal({ product, onClose }: Props) {
  //   const tenant = getTenant();
  if (!product) return null;

  const imageUrl =
    product.images?.length > 0
      ? //   cloudinaryImage(product.images[0], "large")
        cloudinaryImage(product.images[0], "detail")
      : "/placeholder.png";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white rounded-2xl w-[95%] max-w-4xl p-6 z-10 shadow-2xl animate-fadeIn">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <FiX size={22} />
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* IMAGE */}
          <div className="relative w-full h-[300px] md:h-[450px] bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden">
            <Image
              src={cloudinaryImage(product.images[0], "detail")}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-300 hover:scale-105 bg-gradient-to-b from-gray-50 to-white"
            />
          </div>

          {/* DETAILS */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {product.name}
              </h2>

              <ProductRating
                rating={product.averageRating}
                count={product.reviewCount}
              />

              <p className="text-2xl font-bold text-[var(--color-primary)] mt-4">
                ₦{product.price.toLocaleString()}
              </p>

              <p className="text-sm text-gray-500 mt-3">
                This is a premium product designed for comfort and style.
              </p>
            </div>

            {/* ACTION */}
            <Link href={`/products/details/${product.id}`}>
              <button className="mt-6 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2">
                <FiShoppingCart />
                Add to Cart
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
