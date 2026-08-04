import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import VendorApprovalReview from "../../../../components/admin/vendors/vendorApplicationReview";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

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
  return (
    <>
      <AdminHeaderUI
        title="Vendor applications"
        subtitle="Review and approve vendor access."
      />
      <VendorApprovalReview application={application} />;
    </>
  );
}
