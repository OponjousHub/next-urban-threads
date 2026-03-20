
export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 items-center">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
