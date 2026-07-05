import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { getAuthPayload } from "@/lib/server/auth";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import VendorSettingsForm from "@/components/vendor/settings/vendor-settings-form";
import SettingsPage from "@/components/vendor/settings/settings-tab";

export default async function VendorSettingsPage() {
  const { vendor } = await getCurrentVendor();
  const { tenant } = await getAuthPayload();

  if (!vendor || !tenant) {
    throw new Error("Vendor not found");
  }

  // Load Bank Details
  const bankAccount = await prisma.vendorBankAccount.findUnique({
    where: {
      vendorId: vendor.id,
    },
  });
  const safeVendor = {
    ...vendor,
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
  };

  const social = {
    facebookUrl: vendor.facebookUrl,
    instagramUrl: vendor.instagramUrl,
    twitterUrl: vendor.twitterUrl,
    tiktokUrl: vendor.tiktokUrl,
    youtubeUrl: vendor.youtubeUrl,
    linkedinUrl: vendor.linkedinUrl,
    websiteUrl: vendor.websiteUrl,
    whatsapp: vendor.whatsapp,
  };

  return (
    <>
      <VendorHeaderUI
        title="Store Settings"
        subtitle="Manage your storefront information"
        vendor={vendor}
      />

      <SettingsPage
        vendor={safeVendor}
        bankAccount={bankAccount}
        social={social}
      />
    </>
  );
}
