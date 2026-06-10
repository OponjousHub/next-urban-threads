import { suspendVendor } from "@/app/lib/services/vendor/suspendVendor";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> },
) {
  const { vendorId } = await params;

  await suspendVendor(vendorId);

  return NextResponse.json({
    success: true,
  });
}
