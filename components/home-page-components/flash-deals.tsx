"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import type { Product } from "@/types/product";

function FlashDeals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFlashDeals() {
      try {
        const res = await fetch("/api/products?flash=true");
        const data = await res.json();

        setProducts(data.products.slice(0, 6)); // 👈 limit for UI
      } catch (err) {
        console.error("Failed to load flash deals", err);
      } finally {
        setLoading(false);
      }
    }

    loadFlashDeals();
  }, []);

  return (
    <section className="px-6 md:px-16 py-16 bg-white">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-black">⚡ Flash Deals</h2>

        <Link href="/products?flash=true">
          <button className="px-4 py-2 border rounded-lg text-sm hover:bg-black hover:text-white transition">
            View All
          </button>
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-400">No flash deals available</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const imageUrl =
              product.images?.length > 0
                ? cloudinaryImage(product.images[0], "card")
                : "/placeholder.png";

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                {/* Badge */}
                <span className="absolute bg-red-500 text-white text-xs px-2 py-1 m-2 rounded">
                  SALE
                </span>

                <div className="relative w-full h-40">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-red-500 font-bold mt-1">
                    ₦{product.price.toLocaleString()}
                  </p>

                  <Link href={`/products/details/${product.id}`}>
                    <button className="mt-2 w-full text-sm bg-black text-white py-2 rounded hover:bg-gray-800 transition">
                      Buy Now
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default FlashDeals;

// export default function FlashDeals() {
//   return (
//     <section className="px-6 py-10 bg-red-50">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold text-red-600">🔥 Flash Deals</h2>

//         <span className="text-sm text-gray-500">Limited time offers</span>
//       </div>

//       <div className="grid md:grid-cols-4 gap-4">
//         {/* Map products here */}
//         {[1, 2, 3, 4].map((i) => (
//           <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
//             <div className="h-32 bg-gray-100 mb-3" />
//             <p className="text-sm font-medium">Product name</p>
//             <p className="text-red-600 font-bold">$25</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }
