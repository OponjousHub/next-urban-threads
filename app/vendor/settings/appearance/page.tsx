import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import AppearanceForm from "./appearance-form";

export default async function AppearancePage() {
  const userId = await getLoggedInUserId();

  if (!userId) {
    notFound();
  }

  const vendor = await prisma.vendor.findFirst({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      logo: true,
      banner: true,
      accentColor: true,
      // averageRating: true,
      _count: {
        select: {
          products: true,
          storeFollow: true,
        },
      },
    },
  });

  if (!vendor) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Store Appearance</h1>

        <p className="mt-2 text-gray-500">
          Customize how customers see your storefront.
        </p>
      </div>

      <AppearanceForm vendor={vendor} />
    </div>
  );
}
