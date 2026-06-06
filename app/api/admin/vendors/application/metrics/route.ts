import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    const [
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalApplications,
    ] = await Promise.all([
      prisma.vendorApplication.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.vendorApplication.count({
        where: {
          status: "APPROVED",
        },
      }),

      prisma.vendorApplication.count({
        where: {
          status: "REJECTED",
        },
      }),

      prisma.vendorApplication.count(),
    ]);

    return NextResponse.json({
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalApplications,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch metrics",
      },
      {
        status: 500,
      },
    );
  }
}
