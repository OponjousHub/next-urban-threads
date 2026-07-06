"use client";

import { Package2, Star, MessageSquare, CalendarDays } from "lucide-react";

type Props = {
  products: number;
  reviews: number;
  rating: number;
  joined: Date | string;
};

export default function VendorStats({
  products,
  reviews,
  rating,
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
    <section className="-mt-16 relative z-30">
      <div className="mx-auto max-w-6xl rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4">
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
                  px-8
                  py-10
                  transition-all
                  duration-300
                  hover:bg-gray-50

                  ${
                    index !== stats.length - 1
                      ? "md:border-r border-gray-200"
                      : ""
                  }
                `}
              >
                {/* Icon */}

                <div
                  className={`
                    mb-6
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    ${item.bg}
                  `}
                >
                  <Icon className={`h-8 w-8 ${item.color}`} />
                </div>

                {/* Value */}

                <h3 className="text-5xl font-bold tracking-tight text-gray-900">
                  {item.value}
                </h3>

                {/* Label */}

                <p className="mt-3 text-base text-gray-500">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
