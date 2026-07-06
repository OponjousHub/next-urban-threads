type Props = {
  products: number;
  reviews: number;
  rating: number;
  joined: Date;
};

export default function VendorStats({
  products,
  reviews,
  rating,
  joined,
}: Props) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-4">
      <div>
        <p className="text-3xl font-bold">{products}</p>

        <p className="text-sm text-gray-500">Products</p>
      </div>

      <div>
        <p className="text-3xl font-bold">{rating.toFixed(1)}</p>

        <p className="text-sm text-gray-500">Rating</p>
      </div>

      <div>
        <p className="text-3xl font-bold">{reviews}</p>

        <p className="text-sm text-gray-500">Reviews</p>
      </div>

      <div>
        <p className="text-xl font-semibold">
          {joined.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </p>

        <p className="text-sm text-gray-500">Joined</p>
      </div>
    </div>
  );
}
