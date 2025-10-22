import Image from "next/image";
import Link from "next/link";

function Hero() {
  return (
    <>
      <Image
        src={"/img/featured-img.jpg"}
        alt={"'Hero image"}
        fill
        className="w-full h-full absolute object-fill brightness-65"
      />
      <div className="relative flex flex-col gap-4 items-center justify-center h-[80vh] text-[#fff] overflow-hidden">
        <h1 className="text-[4rem] font-extrabold "> Urban Threads</h1>
        <p className="text-[2rem] text-center">
          Trendy streetwear & accessories for your everyday style.
        </p>
        <Link href={"/products"}>
          <button
            type="button"
            className="flex items-center font-bold px-[32px] py-[14px] text-[2rem] cursor-pointer bg-[var(--color-primary)] rounded-[6px] hover:bg-[#3730a3]"
          >
            Shop Now
          </button>
        </Link>
      </div>
    </>
  );
}
export default Hero;
