import { NextResponse } from "next/server";
import { createRefundRequest } from "@/app/lib/refunds/refund.service";

export async function POST(req: Request) {
  const body = await req.json();

  const refund = await createRefundRequest(body);

  return NextResponse.json(refund);
}
