import { NextRequest, NextResponse } from "next/server";
import { calculateShipping } from "@/app/lib/shipping/shipping-calculator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await calculateShipping(body);

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Unable to calculate shipping" },
      { status: 500 },
    );
  }
}
