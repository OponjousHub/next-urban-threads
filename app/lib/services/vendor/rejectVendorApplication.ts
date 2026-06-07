import { prisma } from "@/utils/prisma";

export async function rejectVendorApplication(
  applicationId: string,
  rejectionReason?: string,
) {
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
