import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function Row({ product }: { product: any }) {
  const stockStatus =
    product.stock === 0 ? "out" : product.stock <= 5 ? "low" : "ok";

  return (
    <tr className="border-t hover:bg-gray-50 transition h-16">
      {/* fixed row height */}
      {/* Product */}
      <td className="p-4">
        <div className="flex items-center gap-3 h-full">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
          )}

          <div className="flex flex-col justify-center h-full">
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-gray-500">ID: {product.id}</p>
          </div>
        </div>
      </td>
      {/* Price */}
      <td className="align-middle">₦{product.price.toLocaleString()}</td>
      {/* Stock */}
      <td className="align-middle">
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

      {/* Actions */}
      <td className="pr-4 align-middle">
        <div className="flex justify-end items-center gap-2 h-full">
          <button className="text-gray-600 hover:text-blue-600">
            <FiEdit size={18} />
          </button>
          <button className="text-gray-600 hover:text-red-600">
            <FiTrash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
