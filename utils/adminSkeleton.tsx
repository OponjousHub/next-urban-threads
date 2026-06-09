export function VendorDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6" />

      <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-8" />

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-2xl border bg-white p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6" />

            <div className="space-y-4">
              {[1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="h-4 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
