"use client";

import Image from "next/image";
import { useCart } from "@/store/cart-context";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import { cloudinaryDetailImage } from "@/utils/cloudinary-url";
import { ProductDetailSkeleton } from "./products/productDetailSkeleton";
import { ReviewForm } from "@/components/reviews/reviewForm";
import { ReviewList } from "@/components/reviews/reviewList";
import { RatingSummary } from "@/components/reviews/ratingSummary";
import { useRouter } from "next/navigation";
import { useRecentlyViewed } from "./products/useRecentlyViewed";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTenant } from "@/store/tenant-provider-context";
import { appToast } from "@/utils/appToast";
import { generateId } from "@/utils/generateId";

interface Props {
  product: Product;
  reviews: any[];
  canReview: boolean;
  userReview: any | null;
  role: string;
}

const COLOR_MAP: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Blue: "#2563eb",
  Brown: "#92400e",
  Red: "#dc2626",
  Green: "#16a34a",
  Yellow: "#eab308",
  Pink: "#ec4899",
  Purple: "#9333ea",
  Gray: "#6b7280",
  Orange: "#ea580c",
  Beige: "#d6c7a1",
};

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
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();
  const { tenant } = useTenant();

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

  useEffect(() => {
    if (selectedVariant?.image) {
      const index = media.findIndex((m) => m.url === selectedVariant.image);

      if (index !== -1) {
        setActiveMediaIndex(index);
      }
    }
  }, [selectedVariant?.image]);

  const isOutOfStock =
    selectedVariant?.stock !== undefined && selectedVariant.stock <= 0;

  const displayPrice = selectedVariant
    ? safePrice(selectedVariant.price)
    : safePrice(product.price);

  const mainImage = selectedVariant?.image || product.images?.[0];

  const videos = (product.videos || []) as {
    url: string;
    public_id: string;
  }[];

  const media: {
    type: "image" | "video";
    url: string;
  }[] = [
    ...product.images.map((img) => ({
      type: "image" as const,
      url: img,
    })),

    ...videos.map((video) => ({
      type: "video" as const,
      url: video.url,
    })),
  ];

  const displayMedia =
    selectedMedia ||
    (selectedVariant?.image
      ? {
          type: "image",
          url: selectedVariant.image,
        }
      : media[activeMediaIndex]);

  /* ---------------- CART ---------------- */
  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      appToast.warning("Warning", "Please select color & size");
      return;
    }

    // ✅ STOCK SAFETY
    if (selectedVariant && quantity > selectedVariant.stock) {
      appToast.warning("Warning", `Only ${selectedVariant.stock} available`);
      return;
    }
    addToCart({
      id: generateId(),

      productId: product.id,
      variantId: selectedVariant?.id,

      name: product.name,
      price: displayPrice,
      image: mainImage || product.images[0],
      quantity,

      stock: selectedVariant?.stock || product.stock,

      variantColor: selectedColor || undefined,
      variantSize: selectedSize || undefined,
    });
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
    setSelectedMedia(null);
  }, [selectedVariant?.color, selectedVariant?.size]);

  const handleBuyButton = () => {
    const buyNowItem = {
      id: generateId(),

      productId: product.id,

      variantId: selectedVariant?.id,

      name: product.name,

      image: mainImage || product.images[0],

      price: displayPrice,

      quantity,

      stock: selectedVariant?.stock || product.stock,

      variantColor: selectedColor || undefined,

      variantSize: selectedSize || undefined,
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
            {displayMedia?.type === "image" ? (
              <Image
                src={cloudinaryDetailImage(displayMedia.url, "detail")}
                alt={product.name}
                width={800}
                height={800}
              />
            ) : displayMedia?.type === "video" ? (
              <video
                src={displayMedia.url}
                controls
                className="w-full h-[400px] rounded-2xl object-cover"
              />
            ) : null}
          </div>

          <div className="flex gap-3">
            {media.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedMedia(item);
                  setActiveMediaIndex(i);
                }}
                className={`border rounded-xl overflow-hidden relative ${
                  activeMediaIndex === i
                    ? "border-black ring-2 ring-black"
                    : "border-gray-200"
                }`}
              >
                {item.type === "image" ? (
                  <Image
                    src={cloudinaryDetailImage(item.url, "thumb")}
                    alt=""
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-black flex items-center justify-center text-white text-xs">
                    VIDEO
                  </div>
                )}
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
            {tenant.currency}
            {displayPrice.toLocaleString()}
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
                        backgroundColor:
                          variant?.colorHex || COLOR_MAP[color] || "#000",
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
                onClick={() => {
                  if (!selectedVariant) return;

                  setQuantity((q) => Math.min(selectedVariant.stock, q + 1));
                }}
                disabled={!selectedVariant || quantity >= selectedVariant.stock}
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
                disabled={
                  isOutOfStock ||
                  !selectedVariant ||
                  quantity > selectedVariant.stock
                }
              >
                Buy Now
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-black text-white py-3 rounded-lg"
              disabled={!selectedVariant || quantity >= selectedVariant.stock}
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
                          {tenant.currency}
                          {Number(p.price).toLocaleString()}
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
                {tenant.currency}
                {safePrice(product.price).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-5 py-2 rounded-lg"
            disabled={!selectedVariant || quantity >= selectedVariant.stock}
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
