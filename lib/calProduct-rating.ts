import { prisma } from "@/utils/prisma";

export async function updateProductRating(productId: string) {
  const stats = await prisma.review.aggregate({
    where: {
      productId,
      status: "APPROVED",
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: stats._avg.rating ?? 0,
      reviewCount: stats._count.rating ?? 0,
    },
  });
}
