import { FiShoppingCart, FiSearch } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

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

function AccessoriesPage() {
  // const [search, setSearch] = useState("");
  //   const [category, setCategory] = useState("All");

  // const filteredProducts = productsData.filter((product) => {
  //   const matchesSearch = product.name
  //     .toLowerCase()
  //     .includes(search.toLowerCase());
  //   const matchesCategory = category === "All" || product.category === category;
  //   return matchesSearch && matchesCategory;
  // });
  return (
    <>
      <div className="bg-gray-50 py-10 px-6 min-h-screen max-w-7xl my-0 mx-auto">
        <div className="flex justify-between mt-6 mb-12">
          <h1 className="text-gray-800 text-3xl font-bold">Shop Accessories</h1>
          {/* Search */}
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/2 bg-white">
            <FiSearch size={22} className="text-gray-600 mr-2" />
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full outline-none text-gray-700 text-xl"
              // value={search}
              // onChange={(e) => setSearch(e.target.value)}
            />
          </div>{" "}
        </div>

        <div className="space-x-3 mb-6">
          {["Men", "Women", "Accessories"].map((cat) => (
            <Link key={cat} href={`/products/${cat.toLowerCase()}`}>
              <button
                // onClick={() => setCategory(cat)}
                // className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                //   ${
                //     category === cat
                //       ? "bg-indigo-600 text-white"
                //       : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                //   }
                // `}
                className={
                  "bg-[var(--color-primary)] px-5 py-2 rounded-full text-white transition-all duration-200 font-medium cursor-pointer"
                  // ${
                  //   category === cat
                  //     ? "bg-indigo-600 text-white"
                  //     : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                  // }
                }
              >
                {cat}
              </button>{" "}
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {/* {filteredProducts.length === 0 ? ( */}
          {/* {products.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full">
            No products found.
          </p>
        ) : ( */}
          {/*filteredProducts.map((product) => (*/}
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
                <Link href={"/products/product-id"}>
                  <button className="add-to-cart-btn">
                    <FiShoppingCart size={12} /> Add to Cart
                  </button>
                </Link>
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

export default AccessoriesPage;
