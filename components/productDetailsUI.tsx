"use client";

import Image from "next/image";
import { useCart } from "@/store/cart-context";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { cloudinaryDetailImage } from "@/utils/cloudinary-url";
import { ProductDetailSkeleton } from "./products/productDetailSkeleton";
import { ReviewForm } from "@/components/reviews/reviewForm";
import { ReviewList } from "@/components/reviews/reviewList";
import { RatingSummary } from "@/components/reviews/ratingSummary";
import { useRouter } from "next/navigation";
import { useRecentlyViewed } from "./products/useRecentlyViewed";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Props {
  product: Product;
  reviews: any[];
  canReview: boolean;
  userReview: any | null;
  role: string;
}

export function ProductDetailUI({
  product,
  reviews,
  canReview,
  userReview,
  role,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.variants?.[0]?.size || null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.variants?.[0]?.color || null,
  );
  const [open, setOpen] = useState(false);
  // const [activeImage, setActiveImage] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { addToCart } = useCart();
  const router = useRouter();

  useRecentlyViewed(product);

  if (!product) return <ProductDetailSkeleton />;

  /* ---------------- SAFE PRICE ---------------- */
  function safePrice(value: any): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /* ---------------- VARIANTS ---------------- */
  const variants = product.variants || [];

  const colors = [
    ...new Set(
      variants.map((v) => v.color).filter((c): c is string => Boolean(c)),
    ),
  ];

  const sizes = [
    ...new Set(
      variants.map((v) => v.size).filter((s): s is string => Boolean(s)),
    ),
  ];

  const selectedVariant =
    variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize,
    ) || null;

  const isOutOfStock =
    selectedVariant?.stock !== undefined && selectedVariant.stock <= 0;

  /* ---------------- filter sizes based on selected color ---------------- */

  // const filteredSizes = selectedColor
  //   ? [
  //       ...new Set(
  //         variants
  //           .filter((v) => v.color === selectedColor)
  //           .map((v) => v.size)
  //           .filter((s): s is string => Boolean(s)),
  //       ),
  //     ]
  //   : sizes;

  const displayPrice = selectedVariant
    ? safePrice(selectedVariant.price)
    : safePrice(product.price);

  const mainImage =
    selectedImage || selectedVariant?.image || product.images?.[0];

  /* ---------------- CART ---------------- */
  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Please select color & size");
      return;
    }

    addToCart({
      id: selectedVariant?.id || product.id,
      name: product.name,
      price: displayPrice,
      image: mainImage || product.images[0],
      quantity,
    });

    toast.success("Added to cart");
  };

  /* ---------------- RESET STATE AFTER SWITCHING ---------------- */

  useEffect(() => {
    const firstAvailable = product?.variants?.find((v) => v.stock > 0);

    if (firstAvailable) {
      setSelectedColor(firstAvailable.color || null);
      setSelectedSize(firstAvailable.size || null);
    }
  }, [product]);

  /* ---------------- STICKY BAR ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- RECENT ---------------- */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(stored);
  }, []);

  // RESET WHEN VARIANT CHANGES
  useEffect(() => {
    setSelectedImage(null);
  }, [selectedVariant?.id]);

  const handleBuyButton = () => {
    const buyNowItem = {
      id: selectedVariant?.id || product.id,
      name: product.name,
      price: displayPrice,
      image: mainImage || product.images[0],
      quantity,
    };

    localStorage.setItem("buyNow", JSON.stringify([buyNowItem]));

    router.push("/checkout?mode=buy-now");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10">
        {/* LEFT: IMAGES */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm overflow-hidden">
            <Image
              src={cloudinaryDetailImage(mainImage, "detail")}
              alt={product.name}
              width={800}
              height={800}
              className="w-full h-[400px] object-contain transition-transform duration-500 hover:scale-110"
            />
          </div>

          <div className="flex gap-3">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`border rounded-lg overflow-hidden transition-all ${
                  mainImage === img
                    ? "border-black ring-2 ring-black scale-105"
                    : "border-gray-200 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={cloudinaryDetailImage(img, "thumb")}
                  alt=""
                  width={80}
                  height={80}
                />
              </button>
            ))}
          </div>
        </div>
        {/* RIGHT: DETAILS */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          <RatingSummary
            average={product.averageRating ?? 0}
            count={product.reviewCount ?? 0}
          />

          <p className="text-2xl font-bold text-[var(--color-primary)]">
            ₦{displayPrice.toLocaleString()}
          </p>

          {selectedVariant && (
            <div>
              {selectedVariant.stock > 5 ? (
                <p className="text-sm text-green-600 font-medium">In stock</p>
              ) : selectedVariant.stock > 0 ? (
                <p className="text-sm text-red-500 font-medium">
                  Only {selectedVariant.stock} left in stock
                </p>
              ) : (
                <p className="text-sm text-gray-400 font-medium">
                  Out of stock
                </p>
              )}
            </div>
          )}

          <p className="text-gray-600">{product.description}</p>

          <p className="text-sm text-gray-500">
            Selected:
            <span className="font-medium text-black ml-1">
              {selectedColor} / {selectedSize}
            </span>
          </p>

          {/* COLOR */}
          {colors.length > 0 && (
            <>
              <h3 className="font-semibold">Color</h3>
              <div className="flex gap-3">
                {colors.map((color) => {
                  const variant = variants.find((v) => v.color === color);

                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-10 h-10 rounded-full border-4 transition-all ${
                        selectedColor === color
                          ? "border-black scale-110"
                          : "border-gray-200"
                      }`}
                      style={{
                        backgroundColor: variant?.colorHex || "#000",
                      }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* SIZE */}
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const isAvailable = variants.some(
                (v) =>
                  v.size === size &&
                  (!selectedColor || v.color === selectedColor),
              );

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!isAvailable}
                  className={`
          min-w-[52px] px-4 py-2 rounded-xl border text-sm font-medium
          transition-all duration-200
          ${
            selectedSize === size
              ? "bg-black text-white border-black scale-105"
              : "border-gray-300 hover:border-black"
          }
          ${!isAvailable ? "opacity-30 cursor-not-allowed" : ""}
        `}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* QUANTITY */}
          <div>
            <p className="font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 border rounded"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 border rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA */}
          {role !== "GUEST" ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={
                  (variants.length > 0 && !selectedVariant) || isOutOfStock
                }
                className={`w-full py-3 rounded-lg font-medium transition ${
                  (variants.length > 0 && !selectedVariant) || isOutOfStock
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : variants.length > 0 && !selectedVariant
                    ? "Select options"
                    : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyButton}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg"
                disabled={isOutOfStock}
              >
                Buy Now
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Login to purchase
            </button>
          )}

          {/* REVIEWS */}
          <div className="pt-10">
            <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet</p>
            ) : (
              <ReviewList reviews={reviews} />
            )}

            {(canReview || userReview) && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="mt-4 text-sm underline">
                    {userReview ? "Edit Review" : "Write Review"}
                  </button>
                </DialogTrigger>

                <DialogContent>
                  <ReviewForm
                    productId={product.id}
                    existingReview={userReview}
                    onSuccess={() => setOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>{" "}
      </div>

      {/* RECENT */}
      {recent.length > 1 && (
        <div className="mt-20 border-t pt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold">Recently Viewed</h2>

            <p className="text-sm text-gray-500">Continue where you left off</p>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-5 min-w-max pb-2">
              {recent
                .filter((p) => p.id !== product.id && !p.deletedAt)
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/products/details/${p.id}`)}
                    className="
                w-[220px]
                flex-shrink-0
                bg-white
                rounded-2xl
                overflow-hidden
                shadow-sm
                hover:shadow-xl
                transition-all
                duration-300
                cursor-pointer
                group
              "
                  >
                    <div className="relative overflow-hidden bg-gray-100">
                      <Image
                        src={cloudinaryDetailImage(p.images?.[0], "thumb")}
                        alt={p.name}
                        width={220}
                        height={220}
                        className="
                    w-full
                    h-[220px]
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-105
                  "
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-sm text-gray-800 line-clamp-2">
                        {p.name}
                      </p>

                      {p.price && (
                        <p className="mt-2 font-semibold text-black">
                          ₦{Number(p.price).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* STICKY BAR */}
      {showSticky && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg p-4 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
            <Image
              src={cloudinaryDetailImage(product.images?.[0], "thumb")}
              alt=""
              width={50}
              height={50}
              className="rounded-md"
            />
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">
                ₦{safePrice(product.price).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
