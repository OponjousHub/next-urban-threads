"use client";

import {
  Package2,
  Star,
  MessageSquare,
  CalendarDays,
  Users,
} from "lucide-react";

type Props = {
  products: number;
  reviews: number;
  rating: number;
  followers: number;
  joined: Date | string;
};

export default function VendorStats({
  products,
  reviews,
  rating,
  followers,
  joined,
}: Props) {
  const joinedDate = typeof joined === "string" ? new Date(joined) : joined;

  const stats = [
    {
      icon: Package2,
      label: "Products",
      value: products,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      icon: Star,
      label: "Rating",
      value: rating.toFixed(1),
      bg: "bg-yellow-100",
      color: "text-yellow-500",
    },
    {
      icon: MessageSquare,
      label: "Reviews",
      value: reviews,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      icon: Users,
      label: "Followers",
      value: followers,
      bg: "bg-pink-100",
      color: "text-pink-600",
    },
    {
      icon: CalendarDays,
      label: "Joined",
      value: joinedDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  return (
    <section className="-mt-10 md:-mt-16 relative z-30">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-5">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`
              relative
              flex
              flex-col
              items-center
              justify-center
              px-4
              py-6
              sm:px-6
              sm:py-8
              lg:px-8
              lg:py-10
              transition-all
              duration-300
              hover:bg-gray-50

              border-b
              border-gray-100

              even:border-l

              md:border-b-0
              md:border-l-0
              ${
                index !== stats.length - 1
                  ? "md:border-r md:border-gray-200"
                  : ""
              }
            `}
              >
                {/* Icon */}

                <div
                  className={`
                mb-3
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full

                sm:h-14
                sm:w-14

                lg:h-16
                lg:w-16

                ${item.bg}
              `}
                >
                  <Icon
                    className={`
                  h-6
                  w-6

                  sm:h-7
                  sm:w-7

                  lg:h-8
                  lg:w-8

                  ${item.color}
                `}
                  />
                </div>

                {/* Value */}

                <h3
                  className={`
                font-bold
                tracking-tight
                text-gray-900
                text-center

                ${
                  item.label === "Joined"
                    ? "text-lg sm:text-xl lg:text-2xl"
                    : "text-3xl sm:text-4xl lg:text-5xl"
                }
              `}
                >
                  {item.value}
                </h3>

                {/* Label */}

                <p className="mt-2 text-xs sm:text-sm lg:text-base text-gray-500 text-center">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
