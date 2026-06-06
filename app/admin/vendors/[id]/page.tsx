import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import VendorApprovalReview from "../../../../components/admin/vendors/vendorApplicationReview";

export default async function VendorReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const application = await prisma.vendorApplication.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });

  if (!application) {
    notFound();
  }
  return <VendorApprovalReview application={application} />;
}
