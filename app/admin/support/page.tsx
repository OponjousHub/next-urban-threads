import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import SupportPageClient from "@/components/admin/support/supportPage-client";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    priority?: string;
  };
}) {
  const tenant = await getDefaultTenant();
  const params = await searchParams;

  if (!tenant) return <div>No tenant found</div>;

  const statusParam = params.status?.toUpperCase();
  const priorityParam = params.priority?.toUpperCase();

  //FETCH COUNT FROM DB
  const [unreadCount, urgentCount, allCount, resolvedCount] = await Promise.all(
    [
      prisma.contact.count({
        where: { tenantId: tenant.id, status: "UNREAD" },
      }),

      prisma.contact.count({
        where: { tenantId: tenant.id, priority: "HIGH" },
      }),

      prisma.contact.count({
        where: { tenantId: tenant.id },
      }),

      prisma.contact.count({
        where: { tenantId: tenant.id, status: "RESOLVED" },
      }),
    ],
  );

  // ✅ Fetch with filters
  const messages = await prisma.contact.findMany({
    where: {
      tenantId: tenant.id,
      ...(statusParam && { status: statusParam as any }),
      ...(priorityParam && { priority: priorityParam as any }),
    },
    orderBy: [
      {
        priority: "desc", // 🔥 HIGH first
      },
      {
        createdAt: "desc", // newest second
      },
    ],
  });

  return (
    <SupportPageClient
      messages={messages}
      allCount={allCount}
      statusParam={statusParam}
      urgentCount={urgentCount}
      priorityParam={priorityParam}
      unreadCount={unreadCount}
    />
  );
}
