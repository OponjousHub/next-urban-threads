import { cancelRefund } from "@/app/lib/refunds/refund.service";
import { getLoggedInUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getLoggedInUserId();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }

  const result = await cancelRefund(params.id, userId);

  return Response.json(result);
}
