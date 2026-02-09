import BuyButton from "@/utils/buy-button";
import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";
import { featuredProducts } from "@/data/products";
import { useTenant } from "@/store/tenant-provider-context";

function Featured() {
  const { tenant } = useTenant();
  return (
    <>
      <section className="px-[4rem] py-[6rem] text-center text-[#fafafa] bg-black">
        <h1 className="text-[#fff] text-4xl mt-[4rem] mb-[4rem] font-bold">
          Featured Products
        </h1>
        <div className=" text-[#333] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {featuredProducts?.map((f) => (
            <div key={f.id} className="featured-card-style">
              <div className="relative w-full h-[22rem] mb-7">
                <Image
                  src={f.image}
                  alt={f.name}
                  className="object-cover"
                  fill
                />
              </div>
              <h3 className="font-bold mb-2">{f.name}</h3>
              <p className="text-[var(--color-primary)] font-bold">{`$${f.price}`}</p>
              <Link href={`/products/${f.id}`}>
                <BuyButton />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
export default Featured;
