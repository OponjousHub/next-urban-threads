import DisableTwoFAController from "@/modules/2FA/disable-2FA/2FADisable.controller";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  try {
    // const body = await req.json();
    await DisableTwoFAController.verify(token);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Verification failed" },
      { status: 400 },
    );
  }
}
