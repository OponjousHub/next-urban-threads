import { redirect } from "next/navigation";
import {
  Pending,
  Approved,
  Rejected,
} from "@/components/vendor/application-status";

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
  if (application.status === "PENDING") {
    return <Pending />;
  }
  if (application.status === "APPROVED") {
    return <Approved />;
  }
  if (application.status === "REJECTED") {
    return <Rejected application={application} />;
  }
}
