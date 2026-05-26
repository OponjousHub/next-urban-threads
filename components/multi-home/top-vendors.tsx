export default function TopVendors() {
  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-semibold mb-6">Top Vendors</h2>

      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((v) => (
          <div
            key={v}
            className="border rounded-xl p-4 text-center hover:shadow-md transition"
          >
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-3" />
            <p className="font-medium">Vendor Name</p>
          </div>
        ))}
      </div>
    </section>
  );
}
