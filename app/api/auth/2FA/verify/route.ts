import TwoFAController from "@/modules/2FA/2FA.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("VERIFY TOOOOKEEEEN-----------", body.token);
  const result = await TwoFAController.verify(body.token.replace(/\s/g, ""));

  return NextResponse.json(result, { status: 200 });
}
