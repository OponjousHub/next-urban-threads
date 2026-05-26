import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function PATCH(req: NextRequest) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { mode } = await req.json();

    // Convert UI value → DB enum value
    const storeMode = mode === "SINGLE" ? "SINGLE_VENDOR" : "MULTI_VENDOR";

    await prisma.tenant.update({
      where: {
        id: tenant.id,
      },
      data: {
        storeMode,
      },
    });

    return NextResponse.json({
      success: true,
      storeMode,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update store mode" },
      { status: 500 },
    );
  }
}
