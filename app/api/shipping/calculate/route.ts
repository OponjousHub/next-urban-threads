import { NextRequest, NextResponse } from "next/server";
import { calculateShipping } from "@/app/lib/shipping/shipping-calculator";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: NextRequest) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 },
      );
    }

    const body = await req.json();

    const methods = await calculateShipping({
      tenantId: tenant.id,
      country: body.country,
      state: body.state,
      items: body.items,
    });

    return NextResponse.json(methods);
  } catch (err) {
    console.error("[SHIPPING_CALCULATOR]", err);

    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Unable to calculate shipping",
      },
      { status: 500 },
    );
  }
}
