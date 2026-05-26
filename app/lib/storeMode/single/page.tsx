import Hero from "@/components/single-home/hero";
import Categories from "@/components/single-home/categories";
import FeaturedProducts from "@/components/single-home/featured";
import FlashDeals from "@/components/single-home/flashDeals";
import PromoBanner from "@/components/multi-home/promo-banner";
import Newsletter from "@/components/multi-home/newsletter";

export default function SingleHomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <FlashDeals />
      <PromoBanner />
      <Newsletter />
    </>
  );
}
