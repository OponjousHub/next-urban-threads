import OrdersTable from "@/components/admin/orders/order-table";
import OrderFilters from "@/components/admin/orders/order-filters";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/utils/prisma";

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
  if (!tenant) throw new Error("Default tenant not found");

  const { status, payment, query, from, to } = params;

  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  // Pagination
  const page = parseInt(params.page || "1");
  const pageSize = 10; // 10 orders per page

  const skip = (page - 1) * pageSize;

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      where: {
        tenantId: tenant.id,

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
      // include: {
      //   user: { select: { name: true, email: true } },
      //   items: true,
      // },
      orderBy: { createdAt: "desc" },
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

  return (
    <div className="bg-white border-b px-4 py-4 mb-6 rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
          Orders
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          <OrderFilters />
        </div>
      </div>
      <OrdersTable
        orders={formattedOrders}
        totalOrders={totalOrders}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
