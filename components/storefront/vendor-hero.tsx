"use client";

import Image from "next/image";
import Link from "next/link";
import ShareStoreButton from "../store/share-store-button";
import FollowStoreButton from "../store/follow-store-button";
import { useTenant } from "@/store/tenant-provider-context";
import { useState } from "react";
import {
  Home,
  ChevronRight,
  Share2,
  Heart,
  ShieldCheck,
  Star,
  MapPin,
  CalendarDays,
} from "lucide-react";

import VendorStats from "./vendor-stats";
import VendorSocialLinks from "./vendor-social-links";

type Props = {
  vendor: any;
  averageRating: number;
  totalReviews: number;
  followerCount: number;
};

export default function VendorHero({
  vendor,
  averageRating,
  totalReviews,
  followerCount,
}: Props) {
  const { tenant } = useTenant();
  const [followers, setFollowers] = useState(followerCount);

  const joined = new Date(vendor.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const location =
    [vendor.city, vendor.state, vendor.country].filter(Boolean).join(", ") ||
    "Worldwide";

  return (
    <section className="relative">
      {/* ===========================
            BREADCRUMB
      ============================ */}

      <div className="mb-6 flex items-center justify-between">
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-black"
          >
            <Home size={18} />
            Home
          </Link>

          <ChevronRight size={16} className="text-gray-400" />

          <Link href="/stores" className="text-gray-500 hover:text-black">
            Stores
          </Link>

          <ChevronRight size={16} className="text-gray-400" />

          <span className="font-semibold text-gray-900">{vendor.name}</span>
        </nav>

        {/* ACTIONS */}

        <div className="hidden md:flex items-center gap-4 mt-2">
          <ShareStoreButton
            title={vendor.name}
            description={vendor.description}
          />

          <FollowStoreButton
            tenantId={vendor.tenantId}
            onFollowersChange={(update) => {
              setFollowers((current) =>
                typeof update === "function" ? update(current) : update,
              );
            }}
          />
        </div>
      </div>

      {/* ===========================
            HERO BANNER
      ============================ */}

      <div className="relative overflow-hidden rounded-3xl bg">
        <div className="relative h-[520px] w-full">
          <Image
            src={vendor.banner || "/images/default-store-banner.jpg"}
            alt={vendor.name}
            fill
            priority
            className="object-cover"
          />

          {/* LIGHT OVERLAY */}

          <div className="absolute inset-0 bg-black/30" />

          {/* SOFT GRADIENT */}

          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

          {/* CONTENT */}

          <div className="absolute inset-0 flex items-center">
            {/* <div className="w-full px-10 lg:px-16"> */}
            <div className="mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8">
              <div className="max-w-5xl">
                <div
                  className="
                    rounded-[32px]
                    border
                    border-white/30
                    bg-white/10
                    p-8
                    backdrop-blur-xl
                    shadow-2xl
                  "
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* LOGO */}

                    <div className="shrink-0">
                      <div className="rounded-full border-4 border-white bg-white p-1 shadow-2xl">
                        <Image
                          src={vendor.logo || "/images/default-store-logo.png"}
                          alt={vendor.name}
                          width={170}
                          height={170}
                          className="rounded-full object-cover"
                        />
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-5xl font-bold tracking-tight text-white">
                          {vendor.name}
                        </h1>

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-blue-500
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-white
                          "
                        >
                          <ShieldCheck size={16} />
                          Verified
                        </span>
                      </div>

                      {/* RATING */}

                      <div className="mt-6 flex flex-wrap items-center gap-6 text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                size={20}
                                className="fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>

                          <span className="text-xl font-semibold">
                            {averageRating.toFixed(1)}
                          </span>

                          <span className="text-lg text-white/90">
                            ({totalReviews} Reviews)
                          </span>
                        </div>
                      </div>
                      {/* LOCATION + JOINED */}

                      <div className="mt-6 flex flex-wrap items-center gap-8 text-white/90">
                        <div className="flex items-center gap-3">
                          <MapPin size={18} />

                          <span>{location}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <CalendarDays size={18} />

                          <span>Member since {joined}</span>
                        </div>
                      </div>

                      {/* DESCRIPTION */}

                      {vendor.description && (
                        <p className="mt-8 max-w-3xl text-lg leading-8 text-white/95">
                          {vendor.description}
                        </p>
                      )}

                      {/* SOCIAL */}
                    </div>
                  </div>
                  <div className="mt-10">
                    <VendorSocialLinks vendor={vendor} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===========================
            STATS
      ============================ */}

      <div className="relative -mt-14 z-30 px-6">
        <div className="mx-auto max-w-7xl">
          <VendorStats
            products={vendor.products.length}
            reviews={totalReviews}
            rating={averageRating}
            followers={followers}
            joined={vendor.createdAt}
          />
        </div>
      </div>
    </section>
  );
}
