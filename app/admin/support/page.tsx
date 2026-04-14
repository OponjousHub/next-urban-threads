// /app/admin/support/page.tsx

import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

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

  const { status, priority } = searchParams;

  // ✅ Fetch with filters
  const messages = await prisma.contact.findMany({
    where: {
      tenantId: tenant.id,
      ...(status && { status: status as any }),
      ...(priority && { priority: priority as any }),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Support Inbox</h1>

      {/* ✅ FILTER UI */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <a href="/admin/support" className="px-3 py-1 border rounded">
          All
        </a>
        <a href="?status=UNREAD" className="px-3 py-1 border rounded">
          Unread
        </a>
        <a href="?status=RESOLVED" className="px-3 py-1 border rounded">
          Resolved
        </a>
        <a href="?priority=HIGH" className="px-3 py-1 border rounded">
          Urgent
        </a>
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
              <UpdateButtons id={msg.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////////
// ✅ CLIENT COMPONENT (handles button clicks)
//////////////////////////////////////////////////////////////////

("use client");

import { useTransition } from "react";

function UpdateButtons({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const updateStatus = (status: string) => {
    startTransition(async () => {
      await fetch("/api/admin/support/update", {
        method: "POST",
        body: JSON.stringify({ id, status }),
      });

      window.location.reload();
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus("READ")}
        disabled={isPending}
        className="text-xs bg-blue-500 text-white px-3 py-1 rounded"
      >
        Mark as Read
      </button>

      <button
        onClick={() => updateStatus("RESOLVED")}
        disabled={isPending}
        className="text-xs bg-green-500 text-white px-3 py-1 rounded"
      >
        Resolve
      </button>
    </div>
  );
}
