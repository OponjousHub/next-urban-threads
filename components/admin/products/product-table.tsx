import Row from "./row";

export default function ProductsTable({ products }: { products: any[] }) {
  if (!products.length) {
    return (
      <div className="bg-white rounded-xl p-10 text-center text-gray-500">
        No products found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left text-lg p-4">Product</th>
            <th className="text-left text-lg">Price</th>
            <th className="text-left text-lg">Stock</th>
            <th className="text-right text-lg pr-4">Actions</th>
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
