import { approveVendorApplication } from "@/app/lib/services/vendor/approveVendorApplication";
import { getAuthPayload } from "@/lib/server/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthPayload();

  // Prevent non-admin from approving application
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    await approveVendorApplication(id);

    return NextResponse.json({
      success: true,
      message: "Vendor application approved",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Approval failed",
      },
      {
        status: 400,
      },
    );
  }
}
