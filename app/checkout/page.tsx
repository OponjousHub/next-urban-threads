import { prisma } from "@/utils/prisma";
import CheckoutClient from "./checkoutClient";
import { getLoggedInUserId } from "@/lib/auth";

export default async function CheckoutPage() {
  const userId = await getLoggedInUserId();

  if (!userId) return null;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return <CheckoutClient addresses={addresses} />;
}
