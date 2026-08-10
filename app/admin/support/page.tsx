import { prisma } from "@/utils/prisma";
import { ContactStatus } from "@prisma/client";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import SupportPageClient from "@/components/admin/support/supportPage-client";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    priority?: string;
  };
}) {
  const tenant = await getDefaultTenant();

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  if (!tenant) return <div>No tenant found</div>;

  const params = await searchParams;

  const statusParam = params.status?.toUpperCase();
  const priorityParam = params.priority?.toUpperCase();

  const [unreadCount, urgentCount, allCount, resolvedCount, user] =
    await Promise.all([
      prisma.contact.count({
        where: {
          tenantId: tenant.id,
          status: ContactStatus.UNREAD,
          storeMode: tenant.storeMode,
        },
      }),

      prisma.contact.count({
        where: {
          tenantId: tenant.id,
          priority: "HIGH",
          storeMode: tenant.storeMode,
        },
      }),

      prisma.contact.count({
        where: { tenantId: tenant.id, storeMode: tenant.storeMode },
      }),

      prisma.contact.count({
        where: {
          tenantId: tenant.id,
          status: "RESOLVED",
          storeMode: tenant.storeMode,
        },
      }),

      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          name: true,
          email: true,
          avatarUrl: true,
        },
      }),
    ]);

  const whereClause: any = {
    tenantId: tenant.id,
    storeMode: tenant.storeMode,
  };

  if (statusParam) {
    whereClause.status = statusParam;
  }

  if (priorityParam) {
    whereClause.priority = priorityParam;
  }

  const messages = await prisma.contact.findMany({
    where: whereClause,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <>
      <AdminHeaderUI
        title="Support"
        subtitle="Manage messages from customers"
        admin={admin}
      />
      <SupportPageClient
        messages={messages}
        allCount={allCount}
        statusParam={statusParam}
        urgentCount={urgentCount}
        priorityParam={priorityParam}
        unreadCount={unreadCount}
      />
    </>
  );
}
