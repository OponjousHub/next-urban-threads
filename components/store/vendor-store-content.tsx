"use client";

import { useState } from "react";

import VendorTabs from "./vendor-tabs";

import VendorProductsSection from "./vendor-products-section";
import VendorAboutSection from "./vendor-about-section";
import VendorReviewsSection from "./vendor-reviews-section";
import VendorPoliciesSection from "./vendor-policies-section";

type Props = {
  vendor: any;

  averageRating: number;

  totalReviews: number;

  followers: number;

  reviews: any[];

  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
};

export default function VendorStoreContent({
  vendor,
  averageRating,
  totalReviews,
  followers,
  reviews,
  rating1,
  rating2,
  rating3,
  rating4,
  rating5,
}: Props) {
  const [tab, setTab] = useState<"products" | "about" | "reviews" | "policies">(
    "products",
  );

  return (
    <>
      <VendorTabs active={tab} onChange={setTab} />

      {tab === "products" && (
        <VendorProductsSection products={vendor.products} />
      )}

      {tab === "about" && (
        <VendorAboutSection
          vendor={vendor}
          averageRating={averageRating}
          totalReviews={totalReviews}
          followers={followers}
        />
      )}

      {tab === "reviews" && (
        <VendorReviewsSection
          averageRating={averageRating}
          reviewCount={totalReviews}
          rating1={rating1}
          rating2={rating2}
          rating3={rating3}
          rating4={rating4}
          rating5={rating5}
          reviews={reviews}
        />
      )}

      {tab === "policies" && (
        <VendorPoliciesSection
          shippingPolicy={vendor.shippingPolicy}
          returnPolicy={vendor.returnPolicy}
          termsOfService={vendor.termsOfService}
          privacyPolicy={vendor.privacyPolicy}
        />
      )}
    </>
  );
}
