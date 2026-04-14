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

  if (!tenant) return <div>No tenant found</div>;

  //   const { status, priority } = searchParams;
  const statusParam = searchParams.status?.toUpperCase();
  const priorityParam = searchParams.priority?.toUpperCase();

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
      <h1 className="text-2xl font-bold mb-6">Support Inbox</h1>

      {/* ✅ FILTER UI */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex gap-3 mb-6 flex-wrap">
          <FilterButton
            href="/admin/support"
            label="All"
            active={!statusParam && !priorityParam}
          />

          <FilterButton
            href="/admin/support?status=UNREAD"
            label="Unread"
            active={statusParam === "UNREAD"}
          />

          <FilterButton
            href="/admin/support?status=RESOLVED"
            label="Resolved"
            active={statusParam === "RESOLVED"}
          />

          <FilterButton
            href="/admin/support?priority=HIGH"
            label="Urgent"
            active={priorityParam === "HIGH"}
          />
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
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-1.5 rounded-full text-sm border transition-all duration-200
        ${
          active
            ? "bg-black text-white border-black shadow-sm"
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-black"
        }
      `}
    >
      {label}
    </Link>
  );
}
