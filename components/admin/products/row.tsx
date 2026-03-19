export default function Row({ product }: { product: any }) {
  const stockStatus =
    product.stock === 0 ? "out" : product.stock <= 5 ? "low" : "ok";

  return (
    <tr className="border-t hover:bg-gray-50 transition">
      {/* Product */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200" />

          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-gray-500">ID: {product.id}</p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td>₦{product.price.toLocaleString()}</td>

      {/* Stock */}
      <td>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            stockStatus === "out"
              ? "bg-red-100 text-red-600"
              : stockStatus === "low"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-green-100 text-green-600"
          }`}
        >
          {product.stock === 0
            ? "Out of stock"
            : product.stock <= 5
              ? `Low (${product.stock})`
              : product.stock}
        </span>
      </td>

      {/* Status */}
      <td>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            product.status === "active"
              ? "bg-green-100 text-green-600"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {product.status}
        </span>
      </td>

      {/* Actions */}
      <td className="text-right pr-4">
        <button className="text-sm text-gray-600 hover:text-black">Edit</button>
      </td>
    </tr>
  );
}
