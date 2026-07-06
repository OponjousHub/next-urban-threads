import Image from "next/image";

import VendorSocialLinks from "./vendor-social-links";
import VendorStats from "./vendor-stats";

type Props = {
  vendor: any;
  averageRating: number;
  totalReviews: number;
};

export default function VendorHero({
  vendor,
  averageRating,
  totalReviews,
}: Props) {
  return (
    <section>
      <div className="relative h-72 overflow-hidden rounded-3xl">
        <Image
          src={vendor.banner || "/images/store-banner.jpg"}
          alt={vendor.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="-mt-20 flex flex-col items-center">
        <Image
          src={vendor.logo || "/images/store-logo.png"}
          alt={vendor.name}
          width={140}
          height={140}
          className="rounded-full border-4 border-white bg-white shadow-xl"
        />

        <h1 className="mt-6 text-4xl font-bold">{vendor.name}</h1>

        <div className="mt-2 flex items-center gap-2 text-lg">
          ⭐ {averageRating.toFixed(1)}
          <span className="text-gray-500">({totalReviews} Reviews)</span>
        </div>

        {vendor.description && (
          <p className="mt-6 max-w-2xl text-center text-gray-600">
            {vendor.description}
          </p>
        )}

        <VendorSocialLinks vendor={vendor} />
      </div>

      <VendorStats
        products={vendor.products.length}
        reviews={totalReviews}
        rating={averageRating}
        joined={vendor.createdAt}
      />
    </section>
  );
}
