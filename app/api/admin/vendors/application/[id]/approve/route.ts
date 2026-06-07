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

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const auth = await getAuthPayload();

//     if (!auth?.userId) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { id } = await params;

//     const application = await prisma.vendorApplication.findUnique({
//       where: { id },
//     });

//     if (!application) {
//       return NextResponse.json(
//         { message: "Application not found" },
//         { status: 404 },
//       );
//     }

//     if (application.status !== "PENDING") {
//       return NextResponse.json(
//         {
//           message: "Only pending applications can be approved",
//         },
//         { status: 400 },
//       );
//     }

//     const existing = await prisma.vendorApplication.findFirst({
//       where: {
//         id,
//         status: "PENDING",
//       },
//     });

//     if (existing) {
//       return NextResponse.json(
//         {
//           message: "You already have a pending application.",
//         },
//         { status: 400 },
//       );
//     }

//     const slug = application.businessName
//       .toLowerCase()
//       .trim()
//       .replace(/\s+/g, "-")
//       .replace(/[^a-z0-9-]/g, "");

//     await prisma.$transaction(async (tx) => {
//       const vendor = await tx.vendor.create({
//         data: {
//           name: application.businessName,
//           slug,
//           email: application.businessEmail,
//           phone: application.businessPhone,
//           status: VendorStatus.APPROVED,
//         },
//       });

//       await tx.user.update({
//         where: {
//           id: application.userId,
//         },
//         data: {
//           role: Role.Vendor,
//           vendorId: vendor.id,
//         },
//       });

//       await tx.vendorApplication.update({
//         where: {
//           id: application.id,
//         },
//         data: {
//           status: "APPROVED",
//           reviewedAt: new Date(),
//           reviewedBy: auth.userId,
//         },
//       });
//     });

//     return NextResponse.json({
//       success: true,
//     });
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json({ message: "Approval failed" }, { status: 500 });
//   }
// }
