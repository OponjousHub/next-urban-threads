"use client";

import { useProducts } from "@/store/products-context";
import { useParams } from "next/navigation";
import { FiStar } from "react-icons/fi";
import Image from "next/image";
import { useCart } from "@/store/cart-context";
import { Product } from "@/types/product";
import { useState } from "react";
import toast from "react-hot-toast";

export function ProductDetailUI() {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { menProducts, womenProducts, otherProducts } = useProducts();
  const allProducts = [...menProducts, ...womenProducts, ...otherProducts];
  const params = useParams();

  const product = allProducts.find(
    (pro) => pro.id === Number(params.productId)
  );

  if (!product)
    return <p className="text-center text-gray-500">Product Not Found!</p>;

  const handleAddToCart = (prod: Product) => {
    addToCart(prod);

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
            src={product.image}
            alt={product.name}
            fill
            className="rounded-2xl w-full ahadow-lg max-w-md object-cover"
          />
        </div>
        {/*Right: Product infor*/}
        <div className="space-y-6">
          <h1 className="text-4xl text-gray-800 font-bold">{product.name}</h1>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar
                key={i}
                className={`${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-gray-600 ml-1">
              ({product.reviews} reviews)
            </span>
          </div>
          <p className="text-3xl font-semibold text-indigo-600">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          {/* Size Options */}
          <h3 className="font-semibold text-gray-800 mb-2">Select Size:</h3>
          <div className="flex gap-3">
            {product.sizes.map((size) => (
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
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition w-full md:w-auto"
          >
            Add to Cart
          </button>
          {/* Category */}
          <p className="text-gray-500 text-sm">
            Category:{" "}
            <span className="text-gray-700 font-medium">
              {product.category}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
