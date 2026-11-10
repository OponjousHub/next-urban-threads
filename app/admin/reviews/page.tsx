import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import ReviewsTable from "@/components/admin/reviews/ReviewsTable";

export default async function AdminReviewsPage() {
  const tenant = await getDefaultTenant();

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  if (!tenant) {
    throw new Error("Tenant not found");
  }
  const [reviews, user] = await Promise.all([
    prisma.review.findMany({
      where: {
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            vendor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        avatarUrl: true,
      },
    }),
  ]);

  const reviewRows = reviews.map((review) => ({
    id: review.id,
    title: review.title,
    comment: review.comment,
    rating: review.rating,
    status: review.status,
    createdAt: review.createdAt.toISOString(),
    product: {
      name: review.product.name,
      vendorName: review.product.vendor?.name ?? null,
    },
    user: review.user
      ? {
          name: review.user.name,
          email: review.user.email,
        }
      : null,
  }));

  const totalReviews = reviews.length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "APPROVED",
  ).length;

  const pendingReviews = reviews.filter(
    (review) => review.status === "PENDING",
  ).length;

  const rejectedReviews = reviews.filter(
    (review) => review.status === "REJECTED",
  ).length;

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <>
      <AdminHeaderUI
        title="Reviews"
        subtitle="Manage product reviews"
        admin={admin}
      />
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Reviews</p>

            <h2 className="mt-2 text-3xl font-bold">{totalReviews}</h2>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Approved</p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {approvedReviews}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>

            <h2 className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingReviews}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Rejected</p>

            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {rejectedReviews}
            </h2>
          </div>
        </div>

        {/* Reviews Table */}
        <ReviewsTable reviews={reviewRows} />
      </div>
    </>
  );
}
