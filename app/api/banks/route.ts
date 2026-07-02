import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/server/auth";
import { resolvePaymentConfig } from "@/app/lib/payments/payment";
import { getPaymentProvider } from "@/app/lib/payments/factory";

export async function GET() {
  try {
    const { tenant } = await getAuthPayload();

    if (!tenant) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!tenant.country) {
      return NextResponse.json(
        { message: "Tenant country not configured." },
        { status: 400 },
      );
    }

    const config = resolvePaymentConfig(tenant.country);

    const provider = getPaymentProvider(config.provider);

    const banks = await provider.getBanks(tenant.country);

    return NextResponse.json(banks);
  } catch (error) {
    console.error("Bank Fetch Error:", error);

    return NextResponse.json(
      { message: "Unable to fetch banks." },
      { status: 500 },
    );
  }
}
