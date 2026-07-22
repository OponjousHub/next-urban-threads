import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";

export async function getCurrentVendor() {
  const userId = await getLoggedInUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      vendorId: true,
      role: true,
    },
  });

  if (!user?.vendorId) {
    throw new Error("Vendor account not found");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: user?.vendorId },
  });

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  return {
    vendorId: user.vendorId,
    role: user.role,
    vendor,
  };
}
