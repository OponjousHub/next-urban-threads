import { prisma } from "@/utils/prisma";

export async function suspendVendor(
  vendorId: string,
  suspensionReason: string,
) {
  return prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      status: "SUSPENDED",
      suspensionReason,
    },
  });
}
