import { FiStar } from "react-icons/fi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

interface Props {
  rating?: number;
  count?: number;
}

export function ProductRating({ rating = 0, count = 0 }: Props) {
  if (!count) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <FiStar />
        <span>No reviews yet</span>
      </div>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-2">
      {/* Stars */}
      <div
        className="flex items-center gap-1 text-yellow-500"
        style={{ color: "#eab308" }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return <FaStar key={star} />;
          }
          if (star === fullStars + 1 && hasHalf) {
            return <FaStarHalfAlt key={star} />;
          }
          return (
            <FiStar
              key={star}
              className="text-yellow-500"
              style={{ color: "#eab308" }}
            />
          );
        })}
      </div>

      {/* Rating value */}
      <span className="text-sm font-medium text-gray-700">
        {rating.toFixed(1)}
      </span>

      {/* Review count */}
      <span className="text-sm text-gray-500">({count})</span>
    </div>
  );
}

// interface Props {
//   rating?: number;
//   count?: number;
// }

// export function ProductRating({ rating = 0, count = 0 }: Props) {
//   const fullStars = Math.floor(rating);
//   const hasHalf = rating % 1 >= 0.5;

//   return (
//     <div className="flex items-center gap-1 text-sm">
//       {[1, 2, 3, 4, 5].map((star) => {
//         if (star <= fullStars) {
//           return (
//             <FaStar
//               key={star}
//               className="text-yellow-500"
//               style={{ color: "#eab308" }}
//             />
//           );
//         }

//         if (star === fullStars + 1 && hasHalf) {
//           return (
//             <FaStarHalfAlt
//               key={star}
//               className="text-yellow-500"
//               style={{ color: "#eab308" }}
//             />
//           );
//         }

//         return <FiStar key={star} className="text-gray-300" />;
//       })}

//       {count > 0 && <span className="text-gray-500 ml-1">({count})</span>}
//     </div>
//   );
// }
