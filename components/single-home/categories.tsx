// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// type Category = {
//   id: string;
//   name: string;
//   slug: string;
//   image: string;
// };

// export default function Categories() {
//   const [categories, setCategories] = useState<Category[]>([]);

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await fetch("/api/category");

//         const data = await res.json();
//         console.log("FRONTEND CATEGORY FETCH", data);

//         if (!res.ok) {
//           throw new Error(
//             data.message || data.error || "Could not fetch categories",
//           );
//         }

//         setCategories(data.slice(0, 6));
//       } catch (err: any) {
//         console.error(err);
//       }
//     }

//     load();
//   }, []);

//   return (
//     <section className="max-w-7xl mx-auto px-6 py-20">
//       <div className="flex justify-between mb-10">
//         <h2 className="text-4xl font-bold">Shop Categories</h2>

//         <Link href="/products">View all</Link>
//       </div>

//       <div className="grid md:grid-cols-3 gap-8">
//         {categories.map((cat) => (
//           <Link key={cat.id} href={`/products?category=${cat.slug}`}>
//             <div className="group rounded-3xl overflow-hidden relative h-[300px]">
//               <img
//                 src={cat.image}
//                 className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
//               />

//               <div className="absolute inset-0 bg-black/25" />

//               <div className="absolute bottom-8 left-8 text-white">
//                 <h3 className="text-2xl font-bold">{cat.name}</h3>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch("/api/category", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || data.error || "Could not fetch categories",
          );
        }

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("CATEGORY FETCH ERROR:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const visibleCategories = categories.slice(0, 6);
  const hasMoreCategories = categories.length > 6;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="py-16">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Browse
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Shop Categories
            </h2>
          </div>

          {!loading && hasMoreCategories && (
            <Link
              href="/products"
              className="shrink-0 text-sm font-medium text-gray-600 transition hover:text-[var(--color-primary)]"
            >
              View more →
            </Link>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="relative h-[260px] overflow-hidden rounded-3xl bg-gray-200 animate-pulse md:h-[300px]"
              >
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gray-300/70" />
              </div>
            ))}
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              No categories available right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {visibleCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="group"
              >
                <div className="relative h-[260px] overflow-hidden rounded-3xl bg-gray-100 shadow-sm md:h-[300px]">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <span className="text-sm text-gray-400">{cat.name}</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 transition duration-300 group-hover:bg-black/30" />

                  {/* Bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Category name */}
                  <div className="absolute bottom-7 left-7 right-7">
                    <h3 className="text-2xl font-bold text-white transition-transform duration-300 group-hover:-translate-y-1">
                      {cat.name}
                    </h3>

                    <span className="mt-1 inline-block text-sm text-white/80 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      Shop now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
