"use client";

import { FiShoppingCart, FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { cloudinaryImage } from "@/utils/cloudinary-url";

function WomenItems() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?category=WOMEN")
      .then((res) => res.json())
      .then((data) => {
        const prodData = data.products;
        setProducts(prodData);
      });
  }, []);
  return (
    <div className="bg-gray-50 py-10 px-6 min-h-screen max-w-7xl my-0 mx-auto">
      <div className="flex justify-between mt-6 mb-12">
        <h1 className="text-gray-800 text-3xl font-bold">
          Shop Women Products
        </h1>
        {/* Search */}
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/2 bg-white">
          <FiSearch size={22} className="text-gray-600 mr-2" />
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full outline-none text-gray-700 text-xl"
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
          />
        </div>{" "}
      </div>

      <div className="space-x-3 mb-6">
        {["Men", "Women", "Accessories"].map((cat) => (
          <Link key={cat} href={`/products/${cat.toLowerCase()}`}>
            <button
              className={
                "bg-[var(--color-primary)] px-5 py-2 rounded-full text-white transition-all duration-200 font-medium cursor-pointer"
              }
            >
              {cat}
            </button>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
        {products.map((product) => {
          const imageUrl =
            product.images?.length > 0
              ? cloudinaryImage(product.images[0], "card")
              : "/placeholder.png";
          return (
            <div
              key={product.id}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl"
            >
              <div className="relative w-full h-52">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-[1.2rem]">{product.name}</h3>
                <p className="font-bold text-[var(--color-primary)] my-2 text-xl">
                  ₦{product.price.toLocaleString()}
                </p>
                <Link href={`/products/${product.id}`}>
                  <button className="add-to-cart-btn">
                    <FiShoppingCart size={12} /> Add to Cart
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 flex justify-center gap-4">
        <button className="px-4 py-2 border rounded">Previous</button>
        <button className="px-4 py-2 border rounded bg-indigo-600 text-white">
          1
        </button>
        <button className="px-4 py-2 border rounded">2</button>
        <button className="px-4 py-2 border rounded">Next</button>
      </div>
    </div>
  );
}

export default WomenItems;
