import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/server/auth";
import { rejectVendorApplication } from "@/app/lib/services/vendor/rejectVendorApplication";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthPayload();

  // Prevent non-admin from rejecting apprication
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { rejectionReason } = await req.json();

    if(!rejectionReason) {
      return NextResponse.json({message: "Please provide reason for rejection"},{status: 400})
    }

    await rejectVendorApplication(id, rejectionReason);

    return NextResponse.json({
      success: true,
      message: "Vendor application rejected",
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
