import "@/app/globals.css";

function Categories() {
  return (
    <>
      <section className="px-[4rem] py-[8rem] text-center text-[#fafafa]">
        <h1 className="text-[#333] text-4xl mt-[8rem] mb-[4rem] font-bold">
          Shop by Category
        </h1>
        <div className="text-[#555] grid grid-cols-[repeat(auto-fit,_minmax(180px,_1fr))] gap-8 mt-[2rem]">
          <div className="category-style">Men</div>
          <div className="category-style">Women</div>
          <div className="category-style">Accessories</div>
        </div>
      </section>
    </>
  );
}
export default Categories;
