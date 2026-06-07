import { prisma } from "@/utils/prisma";

export async function rejectVendorApplication(
  applicationId: string,
  rejectionReason?: string,
) {
  const application = await prisma.vendorApplication.findUnique({
    where: {
      id: applicationId,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  //prevent rejecting approved applications
  if (application.status !== "PENDING") {
    throw new Error("Only pending applications can be rejected");
  }

  return prisma.vendorApplication.update({
    where: {
      id: applicationId,
    },
    data: {
      status: "REJECTED",
      rejectionReason,
    },
  });
}
