import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
  };
  verifiedPurchase: boolean;
  createdAt: string;
}

interface Props {
  reviews: Review[];
}

export function ReviewList({ reviews }: Props) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{review.user.name}</div>
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
            <div className="text-xs text-green-600 mt-1">Verified Purchase</div>
          )}

          <p className="text-sm mt-2 text-muted-foreground">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
