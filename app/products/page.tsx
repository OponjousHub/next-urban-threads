import { FiShoppingCart } from "react-icons/fi";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Urban Hoodie",
    price: "$49.99",
    image: "/img/hoodie.png",
  },
  {
    id: 2,
    name: "Denim Jacket",
    price: "$89.99",
    image: "/img/sneekers.jpg",
  },
  {
    id: 3,
    name: "Canvas Sneakers",
    price: "$59.99",
    image: "/img/cap.png",
  },
  {
    id: 4,
    name: "Armani classic watch",
    price: "$97.99",
    image: "/img/watch2.jpg",
  },
  {
    id: 5,
    name: "Toronto bani cap",
    price: "$64.99",
    image: "/img/white cap.jpg",
  },
  {
    id: 6,
    name: "Combo glass & watch",
    price: "$86.99",
    image: "/img/watch glass.jpg",
  },
  // Add more products as needed
];

function AllProctucts() {
  return (
    <>
      <div className="bg-gray-50 py-10 px-6 min-h-screen max-w-7xl my-0 mx-auto">
        <div className="flex justify-between mt-6 mb-12">
          <h1 className="text-gray-800 text-3xl font-bold">Shop Products</h1>
          <div className="space-x-3">
            {["Men", "Women", "Accessories"].map((cat) => (
              <button
                key={cat}
                className="bg-[var(--color-primary)] px-5 py-2 rounded-full text-white transition-all duration-200 font-medium cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl"
            >
              <div className="relative w-full h-52">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="object-cover"
                  fill
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-[1.2rem]">{product.name}</h3>
                <p className="font-bold text-[var(--color-primary)] my-2 text-xl">
                  {product.price}
                </p>
                <button className="add-to-cart-btn">
                  <FiShoppingCart size={12} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center gap-4">
          <button className="px-4 py-2 border rounded">Previous</button>
          <button className="px-4 py-2 border rounded bg-indigo-600 text-white">
            1
          </button>
          <button className="px-4 py-2 border rounded">2</button>
          <button className="px-4 py-2 border rounded">Next</button>
        </div>
      </div>
    </>
  );
}

export default AllProctucts;
