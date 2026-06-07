import { NextResponse } from "next/server";
import { rejectVendorApplication } from "@/app/lib/services/vendor/rejectVendorApplication";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await rejectVendorApplication(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Rejection failed",
      },
      {
        status: 400,
      },
    );
  }
}
