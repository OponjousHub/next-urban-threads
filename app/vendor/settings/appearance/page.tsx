import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import AppearanceForm from "./appearance-form";
import VendorHeaderUI from "@/components/vendor/vendorHeader";

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
      slug: true,
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
    <>
      <VendorHeaderUI
        title="Store Appearance"
        subtitle="Customize how customers see your storefront."
        vendor={vendor}
      />
      <div className="max-w-6xl mx-auto space-y-8">
        <AppearanceForm vendor={vendor} />
      </div>
    </>
  );
}
