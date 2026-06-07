import { prisma } from "@/utils/prisma";
import { Role } from "@prisma/client";
import { getLoggedInUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function approveVendorApplication(applicationId: string) {
  const userId = await getLoggedInUserId();
  if (!userId) {
    return NextResponse.json({ message: " Unauthorized" }, { status: 401 });
  }

  return prisma.$transaction(async (tx) => {
    const application = await tx.vendorApplication.findUnique({
      where: {
        id: applicationId,
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "PENDING") {
      throw new Error("Only pending applications can be approved");
    }

    const user = await tx.user.findUnique({
      where: {
        id: application.userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.vendorId) {
      throw new Error("User already has a vendor account");
    }

    const baseSlug = slugify(application.businessName);

    let slug = baseSlug;
    let count = 1;

    while (
      await tx.vendor.findUnique({
        where: {
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const vendor = await tx.vendor.create({
      data: {
        name: application.businessName,
        slug,
        email: application.businessEmail,
        phone: application.businessPhone,
        status: "APPROVED",
        userId: application.userId,
      },
    });

    await tx.user.update({
      where: {
        id: application.userId,
      },
      data: {
        role: Role.Vendor,
        vendorId: vendor.id,
      },
    });

    await tx.vendorApplication.update({
      where: {
        id: application.id,
      },
      data: {
        status: "APPROVED",
      },
    });

    return vendor;
  });
}
