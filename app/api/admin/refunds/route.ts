import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const { searchParams } = new URL(req.url);
  const requestedPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const where = {
    tenantId: tenant.id,
    storeMode: tenant.storeMode,
  };

  const [
    totalRefunds,
    requestedRefunds,
    approvedRefunds,
    processingRefunds,
    refundedRefunds,
    failedRefunds,
  ] = await Promise.all([
    prisma.refundRequest.count({ where }),
    prisma.refundRequest.count({
      where: { ...where, status: "REQUESTED" },
    }),
    prisma.refundRequest.count({
      where: { ...where, status: "APPROVED" },
    }),
    prisma.refundRequest.count({
      where: { ...where, status: "PROCESSING" },
    }),
    prisma.refundRequest.count({
      where: { ...where, status: "REFUNDED" },
    }),
    prisma.refundRequest.count({
      where: { ...where, status: "FAILED" },
    }),
  ]);

  const totalPages = Math.ceil(totalRefunds / PAGE_SIZE);
  const currentPage =
    totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);

  const refunds = await prisma.refundRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      orderId: true,
      status: true,
      requestedAmount: true,
      createdAt: true,
      reason: true,
    },
  });

  return NextResponse.json({
    refunds,
    totalRefunds,
    requestedRefunds,
    approvedRefunds,
    processingRefunds,
    refundedRefunds,
    failedRefunds,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
  });
}
