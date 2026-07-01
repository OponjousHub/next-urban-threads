import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export async function PATCH(req: Request) {
  try {
    const { vendor } = await getCurrentVendor();

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 },
      );
    }

    const body = await req.json();

    const exists = await prisma.vendor.findFirst({
      where: {
        storeSlug: body.storeSlug,
        NOT: {
          id: vendor.id,
        },
      },
    });

    if (exists) {
      return NextResponse.json(
        { message: "Store slug already exists." },
        { status: 400 },
      );
    }

    await prisma.vendor.update({
      where: {
        id: vendor.id,
      },

      data: {
        name: body.name,
        description: body.description,

        email: body.email,
        phone: body.phone,

        logo: body.logo,
        banner: body.banner,

        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,

        storeSlug: body.storeSlug,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to update store profile.",
      },
      {
        status: 500,
      },
    );
  }
}
