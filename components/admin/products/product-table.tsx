function ProductsTable({ products }: { products: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left p-4">Product</th>
            <th className="text-left">Price</th>
            <th className="text-left">Stock</th>
            <th className="text-left">Status</th>
            <th className="text-right pr-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <Row key={product.id} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
