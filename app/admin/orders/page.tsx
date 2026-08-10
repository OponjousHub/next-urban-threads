import OrdersTable from "@/components/order/order-table";
import OrderFilters from "@/components/order/order-filters";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/utils/prisma";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    status?: string;
    payment?: string;
    query?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const tenant = await getDefaultTenant();

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }
  if (!tenant) throw new Error("Default tenant not found");

  const { status, payment, query, from, to } = params;

  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  // Pagination
  const page = parseInt(params.page || "1");
  const pageSize = 10; // 10 orders per page

  const skip = (page - 1) * pageSize;

  const [orders, totalOrders, user] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      where: {
        tenantId: tenant.id,
        storeMode: tenant.storeMode,

        ...(status &&
          status !== "ALL" && {
            status: status as OrderStatus,
          }),

        ...(payment &&
          payment !== "ALL" && {
            paymentStatus: payment as PaymentStatus,
          }),

        ...(fromDate || toDate
          ? {
              createdAt: {
                ...(fromDate && { gte: fromDate }),
                ...(toDate && { lte: toDate }),
              },
            }
          : {}),

        ...(query && {
          OR: [
            { id: { contains: query } },
            { user: { email: { contains: query } } },
            { user: { name: { contains: query } } },
          ],
        }),
      },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
    }),

    prisma.order.count({
      where: {
        tenantId: tenant.id,
        storeMode: tenant.storeMode,

        ...(status &&
          status !== "ALL" && {
            status: status as OrderStatus,
          }),

        ...(payment &&
          payment !== "ALL" && {
            paymentStatus: payment as PaymentStatus,
          }),

        ...(fromDate || toDate
          ? {
              createdAt: {
                ...(fromDate && { gte: fromDate }),
                ...(toDate && { lte: toDate }),
              },
            }
          : {}),

        ...(query && {
          OR: [
            { id: { contains: query } },
            { user: { email: { contains: query } } },
            { user: { name: { contains: query } } },
          ],
        }),
      },

      orderBy: { createdAt: "desc" },
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

  const totalPages = Math.ceil(totalOrders / pageSize);

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    total: Number(order.totalAmount),
    paymentStatus: order.paymentStatus,
    status: order.status,
    customer: order.user
      ? {
          name: order.user.name ?? "Unknown",
          email: order.user.email,
        }
      : null,
    itemsCount: order.items.length,
  }));

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <>
      <AdminHeaderUI
        title="Orders "
        subtitle="View customer orders and status"
        admin={admin}
      />

      <div className="bg-white border-b px-4 py-4 mb-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <OrderFilters basePath={"/admin/orders"} />
          </div>
        </div>
        <OrdersTable
          basePath={"/admin/orders"}
          orders={formattedOrders}
          totalOrders={totalOrders}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}
