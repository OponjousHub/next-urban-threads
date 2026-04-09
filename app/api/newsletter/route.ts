// import { NextResponse } from "next/server";
// import { prisma } from "@/utils/prisma";

// export async function POST(req: Request) {
//   try {
//     const { email } = await req.json();

//     if (!email) {
//       return NextResponse.json({ error: "Email required" }, { status: 400 });
//     }

//     await prisma.newsletter.create({
//       data: { email },
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await prisma.newsletter.create({
      data: { email },
    });

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully!",
    });
  } catch (err: any) {
    // Handle unique constraint violation
    if (err?.code === "P2002" && err?.meta?.target?.includes("email")) {
      return NextResponse.json(
        { error: "You have already subscribed with this email." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to subscribe. Try again later." },
      { status: 500 },
    );
  }
}
