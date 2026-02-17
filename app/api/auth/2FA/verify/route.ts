import TwoFAController from "@/modules/2FA/2FA.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("VERIFY-ROUTE HIIIIIT ++++++++", body.token);
    const result = await TwoFAController.verify(body.token);
    console.log("RESULT OF 2FA----------", result);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Verification failed" },
      { status: 400 },
    );
  }
}
