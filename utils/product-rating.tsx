import { Star } from "lucide-react";

interface Props {
  rating: number;
  count: number;
}

export function ProductRating({ rating, count }: Props) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-500 text-yellow-500"
              />
            );
          }

          if (i === fullStars && hasHalf) {
            return (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-500/50 text-yellow-500"
              />
            );
          }

          return <Star key={i} className="w-4 h-4 text-gray-300" />;
        })}
      </div>

      {count > 0 ? (
        <span className="text-gray-500">
          {rating.toFixed(1)} ({count})
        </span>
      ) : (
        <span className="text-gray-400">No reviews</span>
      )}
    </div>
  );
}
