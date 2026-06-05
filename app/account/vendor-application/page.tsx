import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import {
  Pending,
  Approved,
  Rejected,
} from "@/components/vendor/application-status";
import { getVendorApplication } from "@/app/lib/getVendorApplication";

export default async function VendorApplicationPage() {
  const auth = await getAuthPayload();

  if (!auth?.userId) {
    redirect("/login");
  }

  const application = await getVendorApplication(auth.userId);
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
