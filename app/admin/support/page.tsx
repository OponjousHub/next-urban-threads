import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { UpdateButtons } from "./update-buttons";
import Link from "next/link";

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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      {/* ✅ FILTER UI */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="sticky top-0 z-10 bg-white border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            📩 Support Inbox <span className="text-gray-400">({allCount})</span>
          </h1>

          <div className="flex gap-3 flex-wrap">
            <FilterButton
              href="/admin/support"
              label="All"
              icon="📬"
              active={!statusParam && !priorityParam}
            />

            <FilterButton
              href="/admin/support?status=UNREAD"
              label="Unread"
              icon="📩"
              badge={unreadCount}
              active={statusParam === "UNREAD"}
            />

            <FilterButton
              href="/admin/support?status=RESOLVED"
              label="Resolved"
              icon="✅"
              active={statusParam === "RESOLVED"}
            />

            <FilterButton
              href="/admin/support?priority=HIGH"
              label="Urgent"
              icon="🔥"
              badge={urgentCount}
              active={priorityParam === "HIGH"}
            />
          </div>
        </div>
      </div>

      {/* ✅ Messages */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="border rounded-xl p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{msg.name}</p>
                <p className="text-sm text-gray-500">{msg.email}</p>
              </div>

              <div className="flex gap-2 text-xs">
                <span className="bg-gray-100 px-2 py-1 rounded">{msg.tag}</span>

                <span
                  className={`px-2 py-1 rounded ${
                    msg.status === "UNREAD"
                      ? "bg-red-100 text-red-600"
                      : msg.status === "RESOLVED"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100"
                  }`}
                >
                  {msg.status}
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
              {msg.message}
            </p>

            {/* ✅ ACTION BUTTONS (client component inside server) */}
            <div className="mt-4">
              <UpdateButtons id={msg.id} status={msg.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  href,
  label,
  active,
  icon,
  badge,
}: {
  href: string;
  label: string;
  active?: boolean;
  icon?: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border
        transition-all duration-200 transform
        hover:scale-105 hover:shadow-sm
        ${
          active
            ? "bg-black text-white border-black shadow-md"
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-black"
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>

      {badge !== undefined && badge > 0 && (
        <span
          className={`
            text-xs px-2 py-0.5 rounded-full
            ${active ? "bg-white text-black" : "bg-red-500 text-white"}
          `}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
