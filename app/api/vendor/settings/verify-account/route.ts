import { resolvePaymentConfig } from "@/app/lib/payments/payment";
import { getPaymentProvider } from "@/app/lib/payments/factory";
import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { tenant } = await getAuthPayload();

    if (!tenant) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bankCode, accountNumber } = await req.json();

    if (!bankCode || !accountNumber) {
      return NextResponse.json(
        {
          message: "Bank and account number are required.",
        },
        { status: 400 },
      );
    }

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

    const config = resolvePaymentConfig(tenantRecord.country);

    const provider = getPaymentProvider(config.currency);

    const result = await provider.verifyBankAccount(bankCode, accountNumber);

    return NextResponse.json({
      accountName: result.accountName,
    });
  } catch (error) {
    console.error(error);

    if (axios.isAxiosError(error)) {
      // Paystack rate limit
      if (error.response?.status === 429) {
        return NextResponse.json(
          {
            message:
              "Too many verification requests. Please wait a few seconds and try again.",
          },
          { status: 429 },
        );
      }

      // Invalid bank/account details
      if (error.response?.status === 400) {
        return NextResponse.json(
          {
            message:
              "Unable to verify this bank account. Please check the bank and account number.",
          },
          { status: 400 },
        );
      }

      // Authentication problem with provider
      if (error.response?.status === 401 || error.response?.status === 403) {
        return NextResponse.json(
          {
            message: "Payment provider authentication failed.",
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        message: "Unable to verify account at this time.",
      },
      { status: 500 },
    );
  }
}
