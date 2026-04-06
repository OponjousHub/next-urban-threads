import Hero from "@/components/home-page-components/hero";
import CategoryGrid from "@/components/home-page-components/categories";
import FlashDeals from "@/components/home-page-components/flash-deals";
import FeaturedProducts from "@/components/home-page-components/featured";
import TopVendors from "@/components/home-page-components/top-vendors";
import PromoBanner from "@/components/home-page-components/promo-banner";
import Newsletter from "@/components/home-page-components/newsletter";

export default function Home() {
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
