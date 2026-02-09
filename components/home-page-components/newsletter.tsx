import BuyButton from "@/utils/buy-button";
import Image from "next/image";
import "@/app/globals.css";
import { useTenant } from "@/store/tenant-provider-context";

function Newsletter() {
  const { tenant } = useTenant();
  return (
    <>
      <section className="px-[4rem] py-[6rem] text-center text-[#fafafa] bg-[var(--color-primary)]">
        <h2 className="text-[#fff] text-4xl mt-[4rem] mb-[2rem] font-bold">
          Stay in the Loop
        </h2>
        <p className="text-[1.8rem]">
          Get the latest updates on new arrivals and exclusive offers.
        </p>
        <form className="flex justify-center items-center gap-6 mt-14">
          <input
            type="email"
            className="newsletter-input"
            placeholder="Enter your email"
          />
          <button className="border-0 bg-white font-[600] text-[var(--color-primary)] text-3xl py-6 px-10 rounded-[6px]">
            Subscribe
          </button>
        </form>
      </section>
    </>
  );
}
export default Newsletter;
