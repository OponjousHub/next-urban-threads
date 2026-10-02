import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  user: {
    name: string | null;
  };
  verifiedPurchase: boolean;
  createdAt: Date;
}

interface Props {
  reviews: Review[];
}

export function ReviewList({ reviews }: Props) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4">
          {/* Customer review */}
          <div className="flex items-center justify-between">
            <div className="font-semibold">
              {review.user.name ?? "Anonymous"}
            </div>

            <div className="flex items-center gap-1">
              {[...Array(review.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>

          {review.verifiedPurchase && (
            <div className="mt-1 text-xs text-green-600">Verified Purchase</div>
          )}

          <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>

          {/* Admin reply */}
          {review.reply && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                Store Response
              </p>

              <p className="mt-1 text-sm text-gray-600">{review.reply}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
