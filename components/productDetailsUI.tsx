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
  const [open, setOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);

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
  console.log("rrrrooooooollllllleeeeeee", role);
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
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
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

// "use client";

// import Image from "next/image";
// import { useCart } from "@/store/cart-context";
// import { Product } from "@/types/product";
// import { useState } from "react";
// import { CartItem } from "@/types/cart";
// import toast from "react-hot-toast";
// import { cloudinaryDetailImage } from "@/utils/cloudinary-url";
// import { ProductDetailSkeleton } from "./products/productDetailSkeleton";
// import { ReviewForm } from "@/components/reviews/reviewForm";
// import { ReviewList } from "@/components/reviews/reviewList";
// import { RatingSummary } from "@/components/reviews/ratingSummary";
// import { useRouter } from "next/router";

// import {
//   Dialog,
//   DialogContent,
//   DialogTrigger,
//   DialogTitle,
// } from "@/components/ui/dialog";

// interface Props {
//   product: Product;
//   reviews: any[];
//   canReview: boolean;
//   userReview: any | null;
//   role: string;
// }

// export function ProductDetailUI({
//   product,
//   reviews,
//   canReview,
//   userReview,
//   role,
// }: Props) {
//   const [quantity, setQuantity] = useState(1);
//   const [open, setOpen] = useState(false);
//   const { addToCart } = useCart();

//   const router = useRouter();

//   if (!product) {
//     return <ProductDetailSkeleton />;
//   }

//   const handleAddToCart = (prod: Product) => {
//     const cartItem: CartItem = {
//       id: prod.id,
//       name: prod.name,
//       price: Number(prod.price),
//       image: prod.images?.[0] ?? "", // pick first image
//       quantity,
//     };

//     addToCart(cartItem);

//     // ✅ Show toast notification
//     toast.success(`${product.name} has been added to your cart!`, {
//       duration: 4000,
//       style: {
//         border: "1px solid #4f46e5",
//         padding: "12px",
//         color: "#333",
//       },
//       iconTheme: {
//         primary: "#4f46e5",
//         secondary: "#fff",
//       },
//     });
//   };
//   console.log("ROOOOLEEE========", role);
//   return (
//     <div className="min-h-screen bg-gray-50 py-16 px-6">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
//         {/* Left: Product Image */}
//         <div className="relative h-120 flex items-center justify-center">
//           <Image
//             src={cloudinaryDetailImage(product.images?.[0], "detail")}
//             alt={product.name}
//             width={800}
//             height={800}
//             priority
//             placeholder="blur"
//             blurDataURL={cloudinaryDetailImage(product.images?.[0], "thumb")}
//           />
//         </div>
//         {/*Right: Product infor*/}
//         <div className="space-y-6">
//           <h1 className="text-4xl text-gray-800 font-bold">{product?.name}</h1>
//           <div className="flex items-center gap-2">
//             <RatingSummary
//               average={product.averageRating ?? 0}
//               count={product.reviewCount ?? 0}
//             />

//             {(canReview || userReview) && (
//               <Dialog open={open} onOpenChange={setOpen}>
//                 <DialogTrigger asChild>
//                   <button className="text-[var(--color-primary)] font-medium hover:underline cursor-pointer">
//                     {userReview ? "Edit Review" : "Write Review"}
//                   </button>
//                 </DialogTrigger>

//                 <DialogContent className="[&>button]:hidden sm:max-w-lg">
//                   <ReviewForm
//                     productId={product.id}
//                     existingReview={userReview}
//                     onSuccess={() => setOpen(false)}
//                   />
//                 </DialogContent>
//               </Dialog>
//             )}
//           </div>
//           <p className="text-3xl font-semibold text-[var(--color-primary)]">
//             ${Number(product?.price)?.toFixed(2)}
//           </p>
//           <p className="text-gray-600 leading-relaxed">
//             {product?.description}
//           </p>
//           {/* Size Options */}
//           <h3 className="font-semibold text-gray-800 mb-2">Select Size:</h3>
//           <div className="flex gap-3">
//             {product?.sizes.map((size) => (
//               <button
//                 key={size}
//                 className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:border-indigo-600 hover:text-indigo-600 transition"
//               >
//                 {size}
//               </button>
//             ))}
//           </div>

//           {/* Quantity Selector */}
//           <h3 className="font-semibold text-gray-800 mb-2">Quantity:</h3>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setQuantity((q) => Math.max(1, q - 1))}
//               className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
//             >
//               -
//             </button>
//             <span className="text-lg font-medium">{quantity}</span>
//             <button
//               onClick={() => setQuantity((q) => q + 1)}
//               className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
//             >
//               +
//             </button>
//           </div>

//           {/* Add to Cart Button */}
//           {/* <button
//             onClick={() => handleAddToCart(product)}
//             className="bg-primary  hover:bg-[var(--color-primary-dark)] text-white px-8 py-3 cursor-pointer rounded-lg font-semibold w-full md:w-auto"
//           >
//             Add to Cart
//           </button> */}
//           {role === "user" ? (
//             <button
//               onClick={handleAddToCart}
//               className="bg-primary  hover:bg-[var(--color-primary-dark)] text-white px-8 py-3 cursor-pointer rounded-lg font-semibold w-full md:w-auto"
//             >
//               Add to Cart
//             </button>
//           ) : (
//             <button
//               onClick={() => router.push("/login")}
//               className="bg-primary  hover:bg-[var(--color-primary-dark)] text-white px-8 py-3 cursor-pointer rounded-lg font-semibold w-full md:w-auto"
//             >
//               Login to buy
//             </button>
//           )}
//           {/* Category */}
//           <p className="text-gray-500 text-sm">
//             Category:{" "}
//             <span className="text-gray-700 font-medium">
//               {product?.category}
//             </span>
//           </p>

//           <div className="mt-16 max-w-4xl mx-auto">
//             <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

//             {reviews.length === 0 ? (
//               <div className="border border-dashed rounded-2xl p-8 text-center space-y-3">
//                 <p className="text-lg font-medium">No reviews yet</p>

//                 {canReview ? (
//                   <p className="text-sm text-muted-foreground">
//                     You purchased this product. Be the first to review it.
//                   </p>
//                 ) : (
//                   <p className="text-sm text-muted-foreground">
//                     Be the first to share your experience with this product.
//                   </p>
//                 )}
//               </div>
//             ) : (
//               <ReviewList reviews={reviews} />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
