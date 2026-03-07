"use client";

interface Product {
  id: number;
  name: string;
  revenue: number;
  sales: number;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Black Urban Hoodie",
    revenue: 4200,
    sales: 120,
    image: "/products/hoodie.jpg",
  },
  {
    id: 2,
    name: "Slim Fit Jeans",
    revenue: 3100,
    sales: 95,
    image: "/products/jeans.jpg",
  },
  {
    id: 3,
    name: "Urban Street Jacket",
    revenue: 2800,
    sales: 70,
    image: "/products/jacket.jpg",
  },
  {
    id: 4,
    name: "Minimal White Tee",
    revenue: 2100,
    sales: 60,
    image: "/products/tshirt.jpg",
  },
];

export default function TopProducts() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Top Products</h3>

        <button className="text-sm text-indigo-600 hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition"
          >
            {/* Rank */}
            <span className="text-sm font-bold text-gray-400 w-5">
              #{index + 1}
            </span>

            {/* Image */}
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Product info */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {product.name}
              </p>
              <p className="text-xs text-gray-500">{product.sales} sales</p>
            </div>

            {/* Revenue */}
            <div className="text-sm font-semibold text-gray-800">
              ${product.revenue}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
