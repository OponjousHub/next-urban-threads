"use client";

import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  verifiedPurchase: boolean;
  createdAt: string | Date;

  user: {
    name: string | null;
    avatar?: string | null;
  };

  product: {
    name: string;
  };
};

type Props = {
  averageRating: number;
  reviewCount: number;

  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;

  reviews: Review[];
};

export default function VendorReviewsSection({
  averageRating,
  reviewCount,
  rating1,
  rating2,
  rating3,
  rating4,
  rating5,
  reviews,
}: Props) {
  const bars = [
    { stars: 5, count: rating5 },
    { stars: 4, count: rating4 },
    { stars: 3, count: rating3 },
    { stars: 2, count: rating2 },
    { stars: 1, count: rating1 },
  ];

  return (
    <section className="mt-20">
      <div className="rounded-3xl border bg-white p-10 shadow-sm">
        <h2 className="text-3xl font-bold">Customer Reviews</h2>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex text-yellow-500">★★★★★</div>

          <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>

          <span className="text-gray-500">({reviewCount} reviews)</span>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[340px_1fr]">
          {/* LEFT */}

          <div>
            {bars.map((bar) => {
              const percentage =
                reviewCount === 0 ? 0 : (bar.count / reviewCount) * 100;

              return (
                <div key={bar.stars} className="mb-5 flex items-center gap-4">
                  <span className="w-14 text-sm">{bar.stars}★</span>

                  <div className="h-3 flex-1 rounded-full bg-gray-200">
                    <div
                      className="h-3 rounded-full bg-yellow-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <span className="w-12 text-right text-sm text-gray-500">
                    {Math.round(percentage)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* RIGHT */}

          <div className="space-y-8">
            {reviews.length === 0 && (
              <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
                No reviews yet.
              </div>
            )}

            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-8 last:border-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {review.user.name || "Anonymous"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {review.product.name}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                <div className="mt-3 flex text-yellow-500">
                  {Array.from({
                    length: review.rating,
                  }).map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>

                {review.title && (
                  <h4 className="mt-3 font-semibold">{review.title}</h4>
                )}

                {review.comment && (
                  <p className="mt-2 leading-7 text-gray-600">
                    {review.comment}
                  </p>
                )}

                {review.verifiedPurchase && (
                  <span className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Verified Purchase
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
