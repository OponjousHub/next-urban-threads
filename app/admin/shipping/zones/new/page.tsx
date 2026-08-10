import ShippingZoneForm from "../shipping-zone-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/utils/prisma";

export default async function NewShippingZonePage() {
  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };
  return (
    <>
      <AdminHeaderUI
        title="Create Shipping Zone"
        subtitle="Shipping zones let you organize destinations for shipping methods and rates."
        admin={admin}
      />
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="New Shipping Zone" />
      </div>
      <div className="mx-auto w-full max-w-5xl px-6 mt-5">
        <ShippingZoneForm />
      </div>
    </>
  );
}
