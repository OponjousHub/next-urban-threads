"use client";

import Image from "next/image";
import { useCart } from "@/store/cart-context";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import { CartItem } from "@/types/cart";
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  // const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const { addToCart } = useCart();
  const router = useRouter();

  useRecentlyViewed(product);
  if (!product) return <ProductDetailSkeleton />;

  /* ------------STICKY ADD TO CART-------------*/
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ------------RECENTLY VIEWED-------------*/
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(stored);
  }, []);

  /* ------------VARIANTS-------------*/
  const variants = product.variants || [];

  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];

  /* ------------Finding selected variants-------------*/
  const selectedVariant = variants.find(
    (v) =>
      (selectedColor ? v.color === selectedColor : true) &&
      (selectedSize ? v.size === selectedSize : true),
  );

  const handleAddToCart = (prod: Product) => {
    if (prod.sizes?.length && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const cartItem: CartItem = {
      id: prod.id,
      name: prod.name,
      price: Number(prod.price),
      image: prod.images?.[0] ?? "",
      quantity,
    };

    addToCart(cartItem);

    toast.success(`${product.name} added to cart`);
  };
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10">
        {/* 🔥 LEFT: IMAGE GALLERY */}
        <div className="space-y-4">
          {/* Main Image */}

          <div className="bg-white rounded-2xl p-4 shadow-sm overflow-hidden">
            <Image
              src={cloudinaryDetailImage(product.images?.[activeImage])}
              alt={product.name}
              width={800}
              height={800}
              className="w-full h-[400px] object-contain transition-transform duration-500 hover:scale-110"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`border rounded-lg overflow-hidden ${
                  activeImage === i ? "border-black" : "border-gray-200"
                }`}
              >
                <Image
                  src={cloudinaryDetailImage(img, "thumb")}
                  alt=""
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* 🔥 RIGHT: DETAILS */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          <RatingSummary
            average={product.averageRating ?? 0}
            count={product.reviewCount ?? 0}
          />

          <p className="text-2xl font-bold text-[var(--color-primary)]">
            ₦{Number(product.price).toLocaleString()}
          </p>

          <p className="text-gray-600">{product.description}</p>

          {/* SIZE */}
          {product.sizes?.length > 0 && (
            <>
              <p className="font-medium">Select Size</p>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded border ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </>
          )}

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
          {role === "ADMIN" ? (
            <div className="flex flex-col gap-3">
              {/* 🛒 Add to Cart */}
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                Add to Cart
              </button>

              {/* ⚡ Buy Now (primary CTA) */}
              <button
                onClick={() => {
                  handleAddToCart(product);
                  router.push("/checkout");
                }}
                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white py-3 rounded-lg font-semibold shadow-md hover:scale-[1.02] transition"
                // className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Buy Now
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-black text-white py-3 rounded-lg font-medium"
            >
              Login to purchase
            </button>
          )}
          {/* {role === "user" ? (
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Add to Cart
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-black text-white py-3 rounded-lg font-medium"
            >
              Login to purchase
            </button>
          )} */}

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

          {/*RECENTLY VIEWED*/}
          {recent.length > 1 && (
            <div className="mt-16">
              <h2 className="text-xl font-semibold mb-4">Recently Viewed</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recent
                  .filter((p) => p.id !== product.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-3 rounded-lg shadow cursor-pointer"
                      onClick={() => router.push(`/products/details/${p.id}`)}
                    >
                      <Image
                        src={cloudinaryDetailImage(p.images?.[0], "thumb")}
                        alt=""
                        width={150}
                        height={150}
                      />
                      <p className="text-sm mt-2">{p.name}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
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
                ₦{Number(product.price).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAddToCart(product)}
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
