import TwoFAController from "@/modules/2FA/2FA.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await TwoFAController.verify(body.token);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Verification failed" },
      { status: 400 },
    );
  }
}
