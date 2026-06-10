import { prisma } from "@/utils/prisma";

export async function reactivateVendor(vendorId: string) {
  return prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      status: "APPROVED",
    },
  });
}
