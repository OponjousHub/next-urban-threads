import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import ReviewTable from "@/components/reviews/review-table";

export default async function VendorReviewsPage() {
  const { vendor } = await getCurrentVendor();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const reviews = await prisma.review.findMany({
    where: {
      product: {
        vendorId: vendor.id,
      },
    },
    include: {
      user: true,
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0";

  const pendingReviews = reviews.filter((r) => r.status === "PENDING").length;

  const verifiedPurchases = reviews.filter((r) => r.verifiedPurchase).length;

  const reviewRows = reviews.map((review) => ({
    id: review.id,
    productName: review.product.name,
    customerName: review.user.name || "Customer",
    rating: review.rating,
    status: review.status,
    verifiedPurchase: review.verifiedPurchase,
    createdAt: review.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Average Rating</p>

          <h2 className="mt-2 text-3xl font-bold">⭐ {averageRating}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Reviews</p>

          <h2 className="mt-2 text-3xl font-bold">{reviews.length}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Verified Purchases</p>

          <h2 className="mt-2 text-3xl font-bold">{verifiedPurchases}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Reviews</p>

          <h2 className="mt-2 text-3xl font-bold">{pendingReviews}</h2>
        </div>
      </div>

      <ReviewTable reviews={reviewRows} basePath="/vendor/reviews" />
    </div>
  );
}
