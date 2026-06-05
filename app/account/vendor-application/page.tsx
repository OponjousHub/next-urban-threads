import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function VendorApplicationPage() {
  const auth = await getAuthPayload();

  if (!auth?.userId) {
    redirect("/login");
  }

  const application = await prisma.vendorApplication.findFirst({
    where: {
      userId: auth.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!application) {
    redirect("/account/become-vendor");
  }

  return <div>Status Page</div>;
}
