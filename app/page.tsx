import Hero from "@/components/home-page-components/hero";
import Categories from "@/components/home-page-components/categories";
import Featured from "@/components/home-page-components/featured";
import Newsletter from "@/components/home-page-components/newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Featured />
      <Newsletter />
    </>
  );
}
