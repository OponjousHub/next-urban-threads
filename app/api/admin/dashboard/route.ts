import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getActivities } from "@/lib/analytics/getActivities";
import { getRecentOrders } from "@/lib/data/orders";
import { getLowStockProducts } from "@/lib/data/products";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Default tenant not found");

  try {
    /* -------------------- Orders -------------------- */
    const orders = await getRecentOrders(tenant.id);

    /* -------------------- Customers -------------------- */
    const totalCustomers = await prisma.user.count({
      where: { role: "USER", tenantId: tenant.id },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newCustomersToday = await prisma.user.count({
      where: {
        role: "USER",
        tenantId: tenant.id,
        createdAt: { gte: today },
      },
    });

    /* -------------------- Low stock -------------------- */
    const lowStock = await getLowStockProducts(tenant.id);

    /* -------------------- Recent orders -------------------- */
    const recentOrders = await prisma.order.findMany({
      where: { tenantId: tenant.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      customer: order.user?.name || "Guest Customer",
      email: order.user?.email || "No email",
      amount: Number(order.totalAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      date: order.createdAt,
    }));

    /* -------------------- Top products -------------------- */
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          tenantId: tenant.id,
          status: {
            in: [OrderStatus.SHIPPED, OrderStatus.DELIVERED],
          },
          paymentStatus: PaymentStatus.PAID,
        },
      },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 4,
    });

    const productIds = topProductsRaw.map((p) => p.productId);

    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, images: true },
    });

    const topProducts = topProductsRaw.map((item) => {
      const product = productDetails.find((p) => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name ?? "Unknown product",
        image: product?.images ?? "/placeholder.png",
        sales: item._sum.quantity ?? 0,
        revenue: item._sum.price?.toNumber?.() ?? 0,
      };
    });

    /* -------------------- Order status -------------------- */
    const statusStats = await prisma.order.groupBy({
      by: ["status"],
      where: { tenantId: tenant.id },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const orderStatus = {
      pending: { count: 0, revenue: 0 },
      processing: { count: 0, revenue: 0 },
      shipped: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
      cancelled: { count: 0, revenue: 0 },
    };

    statusStats.forEach((row) => {
      const revenue = row._sum.totalAmount?.toNumber?.() ?? 0;
      const count = row._count.id ?? 0;

      if (row.status === OrderStatus.PENDING)
        orderStatus.pending = { count, revenue };

      if (row.status === OrderStatus.PROCESSING)
        orderStatus.processing = { count, revenue };

      if (row.status === OrderStatus.SHIPPED)
        orderStatus.shipped = { count, revenue };

      if (row.status === OrderStatus.DELIVERED)
        orderStatus.delivered = { count, revenue };

      if (row.status === OrderStatus.CANCELLED)
        orderStatus.cancelled = { count, revenue };
    });

    /* -------------------- Sales by category -------------------- */
    const salesByCategoryRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          tenantId: tenant.id,
          status: {
            in: [OrderStatus.SHIPPED, OrderStatus.DELIVERED],
          },
          paymentStatus: PaymentStatus.PAID,
        },
      },
      _sum: { quantity: true },
    });

    const productIDs = salesByCategoryRaw.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIDs } },
      select: { id: true, category: true },
    });

    const categoryMap: Record<string, number> = {};

    salesByCategoryRaw.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const category = product?.category ?? "Other";
      const quantity = item._sum.quantity ?? 0;
      categoryMap[category] = (categoryMap[category] || 0) + quantity;
    });

    const salesByCategory = Object.entries(categoryMap).map(
      ([category, sales]) => ({ category, sales }),
    );

    /* -------------------- Activities -------------------- */
    const activities = await getActivities(tenant.id);

    return NextResponse.json({
      newCustomersToday,
      lowStock,
      formattedRecentOrders,
      orderStatus,
      topProducts,
      activities,
      salesByCategory,
      totalCustomers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Dashboard fetch failed" },
      { status: 500 },
    );
  }
}

// import { NextResponse } from "next/server";
// import { prisma } from "@/utils/prisma";
// import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
// import { getActivities } from "@/lib/analytics/getActivities";
// import { getRecentOrders } from "@/lib/data/orders";
// import { getLowStockProducts } from "@/lib/data/products";

// export async function GET() {
//   const tenant = await getDefaultTenant();
//   if (!tenant) {
//     throw new Error("Default tenant not found");
//   }

//   try {
//     /* -------------------- Order -------------------- */
//     const orders = await getRecentOrders(tenant.id);

//     /* -------------------- Customers -------------------- */

//     const totalCustomers = await prisma.user.count({
//       where: { role: "USER", tenantId: tenant.id },
//     });

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     /*--------------------- Today New Customers -------------------*/

//     const newCustomersToday = await prisma.user.count({
//       where: {
//         role: "USER",
//         tenantId: tenant.id,
//         createdAt: { gte: today },
//       },
//     });

//     /* -------------------- Low stock -------------------- */

//     const lowStock = await getLowStockProducts(tenant.id);

//     /* -------------------- Recent orders -------------------- */

//     const recentOrders = await prisma.order.findMany({
//       where: {
//         tenantId: tenant.id,
//       },
//       take: 5,
//       orderBy: {
//         createdAt: "desc",
//       },

//       select: {
//         id: true,
//         totalAmount: true,
//         status: true,
//         createdAt: true,
//         user: {
//           select: {
//             name: true,
//             email: true,
//           },
//         },
//       },
//     });

//     /*--------------------- Transform RecentOrder to desired structure------------- */

//     const formattedRecentOrders = recentOrders.map((order) => ({
//       id: order.id,
//       customer: order.user?.name || "Guest Customer",
//       email: order.user?.email || "No email",
//       amount: Number(order.totalAmount),
//       status:
//         order.status === "PAID"
//           ? "Paid"
//           : order.status === "PENDING"
//             ? "Pending"
//             : order.status === "CANCELLED"
//               ? "Cancelled"
//               : "Paid",
//       date: order.createdAt,
//     }));

//     /* -------------------- Top products -------------------- */

//     const topProductsRaw = await prisma.orderItem.groupBy({
//       by: ["productId"],
//       where: {
//         order: {
//           tenantId: tenant.id,
//           status: {
//             in: ["PAID", "SHIPPED", "DELIVERED"],
//           },
//         },
//       },
//       _sum: {
//         quantity: true,
//         price: true,
//       },
//       orderBy: {
//         _sum: {
//           quantity: "desc",
//         },
//       },
//       take: 4,
//     });
//     // Fetch Products for the IDs

//     const productIds = topProductsRaw.map((p) => p.productId);

//     const productDetails = await prisma.product.findMany({
//       where: {
//         id: { in: productIds },
//       },
//       select: {
//         id: true,
//         name: true,
//         images: true,
//       },
//     });

//     // Merge the result

//     const topProducts = topProductsRaw.map((item) => {
//       const product = productDetails.find((p) => p.id === item.productId);

//       return {
//         id: item.productId,
//         name: product?.name ?? "Unknown product",
//         image: product?.images ?? "/placeholder.png",
//         sales: item._sum.quantity ?? 0,
//         revenue: item._sum.price?.toNumber?.() ?? 0,
//       };
//     });

//     // /*--------------------- Returning Customers ------------- */
//     const orderCounts: Record<string, number> = {};

//     orders.forEach((o) => {
//       orderCounts[o.userId] = (orderCounts[o.userId] || 0) + 1;
//     });

//     // const returningCustomers = Object.values(orderCounts).filter(
//     //   (count) => count > 1,
//     // ).length;

//     // const returningCustomerRate =
//     //   totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

//     /* -------------------- Order status -------------------- */
//     // Querying the database grouped by status

//     const statusStats = await prisma.order.groupBy({
//       by: ["status"],
//       where: {
//         tenantId: tenant.id,
//       },
//       _count: {
//         id: true,
//       },
//       _sum: { totalAmount: true },
//     });

//     /* -------------------- Sales by category -------------------- */

//     const salesByCategoryRaw = await prisma.orderItem.groupBy({
//       by: ["productId"],
//       where: {
//         order: {
//           tenantId: tenant.id,
//           status: {
//             in: ["PAID", "SHIPPED", "DELIVERED"],
//           },
//         },
//       },
//       _sum: {
//         quantity: true,
//       },
//     });

//     // Getting the product category

//     const productIDs = salesByCategoryRaw.map((i) => i.productId);

//     const products = await prisma.product.findMany({
//       where: {
//         id: { in: productIDs },
//       },
//       select: {
//         id: true,
//         category: true,
//       },
//     });

//     // Merge multiple products that may belong to same category
//     const categoryMap: Record<string, number> = {};

//     salesByCategoryRaw.forEach((item) => {
//       const product = products.find((p) => p.id === item.productId);

//       const category = product?.category ?? "Other";

//       const quantity = item._sum.quantity ?? 0;

//       categoryMap[category] = (categoryMap[category] || 0) + quantity;
//     });

//     const salesByCategory = Object.entries(categoryMap).map(
//       ([category, sales]) => ({
//         category,
//         sales,
//       }),
//     );

//     // Converting statusStats to desired structure

//     const orderStatus = {
//       paid: { count: 0, revenue: 0 },
//       pending: { count: 0, revenue: 0 },
//       cancelled: { count: 0, revenue: 0 },
//       delivered: { count: 0, revenue: 0 },
//     };

//     statusStats.forEach((row) => {
//       const revenue = row._sum.totalAmount?.toNumber?.() ?? 0;
//       const count = row._count.id ?? 0;

//       if (row.status === "PAID") {
//         orderStatus.paid = { count, revenue };
//       }

//       if (row.status === "PENDING") {
//         orderStatus.pending = { count, revenue };
//       }

//       if (row.status === "CANCELLED") {
//         orderStatus.cancelled = { count, revenue };
//       }

//       if (row.status === "DELIVERED") {
//         orderStatus.delivered = { count, revenue };
//       }
//     });

//     /* -------------------- Recent Activity -------------------- */

//     // const activities = [
//     //   // Orders
//     //   ...recentOrders.map((order) => ({
//     //     id: `order-${order.id}`,
//     //     type: "order",
//     //     message: `${order.user?.name || "Guest"} placed an order ($${Number(
//     //       order.totalAmount,
//     //     )})`,
//     //     time: order.createdAt,
//     //   })),

//     //   // New users
//     //   ...recentUsers.map((user) => ({
//     //     id: `user-${user.id}`,
//     //     type: "user",
//     //     message: `${user.name || "New user"} created an account`,
//     //     time: user.createdAt,
//     //   })),

//     //   // Low stock
//     //   ...lowStock.map((product) => ({
//     //     id: `stock-${product.id}`,
//     //     type: "stock",
//     //     message: `${product.name} stock running low (${product.stock} left)`,
//     //     time: new Date(),
//     //   })),
//     // ]
//     const activities = await getActivities(tenant.id);

//     return NextResponse.json({
//       newCustomersToday,
//       lowStock,
//       formattedRecentOrders,
//       orderStatus,
//       topProducts,
//       activities,
//       salesByCategory,
//       totalCustomers,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { message: "Dashboard fetch failed" },
//       { status: 500 },
//     );
//   }
// }
