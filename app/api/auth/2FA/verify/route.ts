import TwoFAController from "@/modules/2FA/2FA.controller";
import { NextRequest, NextResponse } from "next/server";

export async function verify2FA(req: NextRequest) {
  const body = await req.json();
  const result = await TwoFAController.verify(body.token);

  return NextResponse.json(result, { status: 200 });
}
