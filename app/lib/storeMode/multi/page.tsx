import Hero from "@/components/multi-home/hero";
import CategoryGrid from "@/components/multi-home/categories";
import FlashDeals from "@/components/multi-home/flash-deals";
import FeaturedProducts from "@/components/multi-home/featured";
import TopVendors from "@/components/multi-home/top-vendors";
import PromoBanner from "@/components/multi-home/promo-banner";
import Newsletter from "@/components/multi-home/newsletter";

export default function MultiVendorHome() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FlashDeals />
      <FeaturedProducts />
      <TopVendors />
      <PromoBanner />
      <Newsletter />
    </>
  );
}
