import { prisma } from "@/utils/prisma";
import CheckoutClient from "./checkoutClient";
import { getLoggedInUser } from "@/lib/auth";

export default async function CheckoutPage() {
  const userId = await getLoggedInUser();

  if (!userId) return null;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return <CheckoutClient addresses={addresses} />;
}
