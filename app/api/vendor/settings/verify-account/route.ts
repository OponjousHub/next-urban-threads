import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/server/auth";
import { prisma } from "@/utils/prisma";
import { resolvePaymentConfig } from "@/app/lib/payments/payment";
import { getPaymentProvider } from "@/app/lib/payments/factory";

export async function POST(req: Request) {
  try {
    const { tenant } = await getAuthPayload();

    if (!tenant) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bankCode, accountNumber } = await req.json();

    if (!bankCode || !accountNumber) {
      return NextResponse.json(
        { message: "Bank and account number are required." },
        { status: 400 },
      );
    }

    // Get tenant country
    const tenantRecord = await prisma.tenant.findUnique({
      where: {
        id: tenant.id,
      },

      select: {
        country: true,
      },
    });

    if (!tenantRecord?.country) {
      return NextResponse.json(
        {
          message: "Tenant country has not been configured.",
        },
        { status: 400 },
      );
    }

    // Determine payment provider
    const config = resolvePaymentConfig(tenantRecord.country);

    const provider = getPaymentProvider(config.currency);

    const result = await provider.verifyBankAccount(bankCode, accountNumber);

    return NextResponse.json({
      accountName: result.accountName,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to verify account.",
      },
      { status: 500 },
    );
  }
}
