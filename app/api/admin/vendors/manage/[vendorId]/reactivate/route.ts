import { NextResponse } from "next/server";
import { reactivateVendor } from "@/app/lib/services/vendor/reactivateVendor";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> },
) {
  const { vendorId } = await params;

  await reactivateVendor(vendorId);

  return NextResponse.json({
    success: true,
  });
}
