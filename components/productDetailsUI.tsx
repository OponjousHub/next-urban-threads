"use client";

import Image from "next/image";
import { useCart } from "@/store/cart-context";
import { Product } from "@/types/product";
import { useState } from "react";
import { CartItem } from "@/types/cart";
import toast from "react-hot-toast";
import { cloudinaryDetailImage } from "@/utils/cloudinary-url";
import { ProductDetailSkeleton } from "./products/productDetailSkeleton";
import { ReviewForm } from "@/components/reviews/reviewForm";
import { ReviewList } from "@/components/reviews/reviewList";
import { RatingSummary } from "@/components/reviews/ratingSummary";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  product: Product;
  reviews: any[];
  canReview: boolean;
  userReview: any | null;
}

export function ProductDetailUI({
  product,
  reviews,
  canReview,
  userReview,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const { addToCart } = useCart();

  if (!product) {
    return <ProductDetailSkeleton />;
  }

  const handleAddToCart = (prod: Product) => {
    const cartItem: CartItem = {
      id: prod.id,
      name: prod.name,
      price: Number(prod.price),
      image: prod.images?.[0] ?? "", // pick first image
      quantity,
    };

    addToCart(cartItem);

    // ✅ Show toast notification
    toast.success(`${product.name} has been added to your cart!`, {
      duration: 4000,
      style: {
        border: "1px solid #4f46e5",
        padding: "12px",
        color: "#333",
      },
      iconTheme: {
        primary: "#4f46e5",
        secondary: "#fff",
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Product Image */}
        <div className="relative h-120 flex items-center justify-center">
          <Image
            src={cloudinaryDetailImage(product.images?.[0], "detail")}
            alt={product.name}
            width={800}
            height={800}
            priority
            placeholder="blur"
            blurDataURL={cloudinaryDetailImage(product.images?.[0], "thumb")}
          />
        </div>
        {/*Right: Product infor*/}
        <div className="space-y-6">
          <h1 className="text-4xl text-gray-800 font-bold">{product?.name}</h1>
          <div className="flex items-center gap-2">
            <RatingSummary
              average={product.averageRating ?? 0}
              count={product.reviewCount ?? 0}
            />

            {(canReview || userReview) && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="text-indigo-600 font-medium hover:underline cursor-pointer">
                    {userReview ? "Edit Review" : "Write Review"}
                  </button>
                </DialogTrigger>

                <DialogContent className="[&>button]:hidden sm:max-w-lg">
                  <ReviewForm
                    productId={product.id}
                    existingReview={userReview}
                    onSuccess={() => setOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          <p className="text-3xl font-semibold text-[var(--color-primary)]">
            ${Number(product?.price)?.toFixed(2)}
          </p>
          <p className="text-gray-600 leading-relaxed">
            {product?.description}
          </p>
          {/* Size Options */}
          <h3 className="font-semibold text-gray-800 mb-2">Select Size:</h3>
          <div className="flex gap-3">
            {product?.sizes.map((size) => (
              <button
                key={size}
                className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:border-indigo-600 hover:text-indigo-600 transition"
              >
                {size}
              </button>
            ))}
          </div>

          {/* Quantity Selector */}
          <h3 className="font-semibold text-gray-800 mb-2">Quantity:</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              -
            </button>
            <span className="text-lg font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => handleAddToCart(product)}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 cursor-pointer rounded-lg font-semibold w-full md:w-auto"
            // className="btn-primary text-white px-8 py-3 cursor-pointer rounded-lg font-semibold transition w-full md:w-auto"
          >
            Add to Cart
          </button>
          {/* Category */}
          <p className="text-gray-500 text-sm">
            Category:{" "}
            <span className="text-gray-700 font-medium">
              {product?.category}
            </span>
          </p>

          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

            {reviews.length === 0 ? (
              <div className="border border-dashed rounded-2xl p-8 text-center space-y-3">
                <p className="text-lg font-medium">No reviews yet</p>

                {canReview ? (
                  <p className="text-sm text-muted-foreground">
                    You purchased this product. Be the first to review it.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Be the first to share your experience with this product.
                  </p>
                )}
              </div>
            ) : (
              <ReviewList reviews={reviews} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
