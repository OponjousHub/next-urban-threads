export default function Loading() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />

        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-56 rounded-xl border bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
