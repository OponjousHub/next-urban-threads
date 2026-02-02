import { prisma } from "@/utils/prisma";
import CheckoutClient from "./checkoutClient";
import { getLoggedInUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const userId = await getLoggedInUserId();

  if (!userId) return null;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <CheckoutClient addresses={addresses} />;
}
