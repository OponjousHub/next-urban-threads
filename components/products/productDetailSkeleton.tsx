// components/product/ProductDetailSkeleton.tsx
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 animate-pulse">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="h-[400px] bg-gray-200 rounded-2xl" />

        {/* Details */}
        <div className="space-y-6">
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />

          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-2/6" />
          </div>

          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-14 bg-gray-200 rounded" />
            ))}
          </div>

          <div className="h-12 bg-gray-300 rounded w-40" />
        </div>
      </div>
    </div>
  );
}
