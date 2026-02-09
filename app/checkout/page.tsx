import { prisma } from "@/utils/prisma";
import CheckoutClient from "./checkoutClient";
import { getLoggedInUserId } from "@/lib/auth";
import { useTenant } from "@/store/tenant-provider-context";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const userId = await getLoggedInUserId();
  const { tenant } = useTenant();

  if (!userId) return null;

  const addresses = await prisma.address.findMany({
    where: { userId, isTemporary: false, isDeleted: false },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <CheckoutClient addresses={addresses} />;
}
