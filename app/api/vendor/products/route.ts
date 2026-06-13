import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export async function GET(req: NextRequest) {
  try {
    const { vendor } = await getCurrentVendor();

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 },
      );
    }

    const products = await prisma.product.findMany({
      where: {
        vendorId: vendor.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: products,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load products" },
      { status: 500 },
    );
  }
}
