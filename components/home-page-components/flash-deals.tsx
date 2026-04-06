export default function FlashDeals() {
  return (
    <section className="px-6 py-10 bg-red-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-red-600">🔥 Flash Deals</h2>

        <span className="text-sm text-gray-500">Limited time offers</span>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {/* Map products here */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="h-32 bg-gray-100 mb-3" />
            <p className="text-sm font-medium">Product name</p>
            <p className="text-red-600 font-bold">$25</p>
          </div>
        ))}
      </div>
    </section>
  );
}
