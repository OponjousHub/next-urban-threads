import "@/app/globals.css";

function Categories() {
  return (
    <section className="px-[4rem] pt-32 pb-16 text-center text-[#fafafa]">
      <h1 className="text-[#333] text-4xl mt-[8rem] mb-[4rem] font-bold">
        Shop by Category
      </h1>

      {/* Category Grid */}
      <div className="text-[#555] grid grid-cols-[repeat(auto-fit,_minmax(180px,_1fr))] gap-8 mt-[2rem]">
        <a href="/products/men" className="category-style">
          Men
        </a>
        <a href="/products/women" className="category-style">
          Women
        </a>
        <a href="/products/accessories" className="category-style">
          Accessories
        </a>
      </div>

      {/* Shop All Button */}
      <div className="mt-[4rem]">
        <a
          href="/products"
          className="inline-block bg-[#4f46e5] text-white text-2xl font-lg px-8 py-3 rounded-lg shadow-lg hover:bg-[#4338ca] transition"
        >
          Shop All Products
        </a>
      </div>
    </section>
  );
}

export default Categories;
