"use client";

import { FiAlertTriangle } from "react-icons/fi";

interface Product {
  id: number;
  name: string;
  stock: number;
}

const products: Product[] = [
  { id: 1, name: "Black Urban Hoodie", stock: 3 },
  { id: 2, name: "Slim Fit Jeans", stock: 5 },
  { id: 3, name: "Street Jacket", stock: 2 },
  { id: 4, name: "White Basic Tee", stock: 4 },
];

export default function LowStockProducts() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <FiAlertTriangle className="text-orange-500" />
        Low Stock
      </h3>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition"
          >
            <span className="text-sm font-medium text-gray-800">
              {product.name}
            </span>

            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-600">
              {product.stock} left
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
