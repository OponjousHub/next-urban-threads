import { approveVendorApplication } from "@/app/lib/services/vendor/approveVendorApplication";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(req: Request) {
  const auth = await getAuthPayload();

  try {
    // Prevent non-admin from approving application
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();

    await Promise.all(ids.map((id: string) => approveVendorApplication(id)));

    return NextResponse.json({
      success: true,
      message: "Vendor application approved",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Bulk approval failed",
      },
      {
        status: 400,
      },
    );
  }
}
