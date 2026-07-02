import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { getAuthPayload } from "@/lib/server/auth";

export async function PATCH(req: Request) {
  const { vendor } = await getCurrentVendor();
  const { tenant } = await getAuthPayload();

  if (!vendor || !tenant) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const account = await prisma.vendorBankAccount.upsert({
    where: {
      vendorId: vendor.id,
    },

    update: {
      bankName: body.bankName,
      accountName: body.accountName,
      accountNumber: body.accountNumber,
    },

    create: {
      vendorId: vendor.id,
      tenantId: tenant.id,

      bankName: body.bankName,
      accountName: body.accountName,
      accountNumber: body.accountNumber,
    },
  });

  return NextResponse.json(account);
}
