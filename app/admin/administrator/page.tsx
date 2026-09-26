import { redirect } from "next/navigation";

import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import AdministratorsPageClient from "./adminPageClient";
import { prisma } from "@/utils/prisma";

export default async function AdministratorsPage() {
  const auth = await getAuthPayload();

  if (!auth?.userId) {
    redirect("/login");
  }

  const admin = await prisma.user.findUnique({
    where: {
      id: auth.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      tenantId: true,
    },
  });

  if (!admin) {
    redirect("/login");
  }

  return (
    <div>
      <AdminHeaderUI
        title="Administrators"
        subtitle="Manage the administrators who have access to your store."
        admin={admin}
      />

      <AdministratorsPageClient />
    </div>
  );
}
