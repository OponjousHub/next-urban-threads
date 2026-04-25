import { NextResponse } from "next/server";
import { createRefundRequest } from "@/app/lib/refunds/refund.service";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }
  const body = await req.json();
  console.log("FUND HAS BEEN REQUESTED", body);

  const refund = await createRefundRequest(body);

  return NextResponse.json(refund);
}
