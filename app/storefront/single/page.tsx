import Hero from "@/components/home/hero";
import FeaturedProducts from "@/components/home/featuredProducts";
import FlashDeals from "@/components/home/flashDeals";
import Categories from "@/components/home/categories";

export default function SingleVendorHome() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <FlashDeals />
    </>
  );
}
