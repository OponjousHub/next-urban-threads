"use client";

import { useState } from "react";
import { FiStar } from "react-icons/fi";
import Image from "next/image";

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);

  // Example static product data — replace with API data
  const product = {
    id: 1,
    name: "Classic Cotton T-Shirt",
    price: 39.99,
    rating: 4.5,
    reviews: 123,
    image: "/img/t-shirt.png",
    // "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    description:
      "Experience comfort and quality with our Classic Cotton T-Shirt, made from 100% organic cotton. Perfect for everyday wear — soft, breathable, and durable.",
    category: "Men",
    sizes: ["S", "M", "L", "XL"],
  };

  //   const handleAddToCart = () => {
  //     alert(`Added ${quantity} × ${product.name} to cart!`);
  //   };

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
            // onClick={handleAddToCart}
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
