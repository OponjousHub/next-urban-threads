import BuyButton from "@/utils/buy-button";
import Image from "next/image";
import "@/app/globals.css";

function Featured() {
  return (
    <>
      <section className="px-[4rem] py-[6rem] text-center text-[#fafafa] bg-black">
        <h1 className="text-[#fff] text-4xl mt-[4rem] mb-[4rem] font-bold">
          Featured Products
        </h1>
        <div className=" text-[#333] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <div className="featured-card-style">
            <div className="relative w-full h-[22rem] mb-7">
              <Image
                src="/img/cap.png"
                alt="Featured image1"
                className="object-cover"
                fill
              />
            </div>
            <h3 className="font-bold mb-2">Classic Cap</h3>
            <p className="text-[#4f46e5] font-bold">$24.99</p>
            <BuyButton />
          </div>
          <div className="featured-card-style">
            <div className="relative w-full h-[22rem] mb-7">
              <Image
                src="/img/sneekers.jpg"
                alt="Featured image2"
                className="object-cover"
                fill
              />
            </div>
            <h3 className="font-bold mb-2">Street Sneekers</h3>
            <p className="text-[#4f46e5] font-bold">$89.99</p>
            <BuyButton />
          </div>
          <div className="featured-card-style">
            <div className="relative w-full h-[22rem] mb-7">
              <Image
                src="/img/hoodie.png"
                alt="Featured image3"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="font-bold mb-2">Urban Hoodie</h3>
            <p className="text-[#4f46e5] font-bold">$59.99</p>
            <BuyButton />
          </div>
        </div>
      </section>
    </>
  );
}
export default Featured;
