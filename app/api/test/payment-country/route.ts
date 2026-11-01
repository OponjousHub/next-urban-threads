import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

function createCountrySignature(country: string, secret: string) {
  return createHmac("sha256", secret).update(country).digest("hex");
}

export async function POST(request: NextRequest) {
  const secret = process.env.PAYMENT_COUNTRY_TEST_SECRET;
  const country = process.env.PAYMENT_COUNTRY_TEST;

  if (!secret || !country) {
    return NextResponse.json(
      { error: "Country testing is not configured." },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();

    const suppliedSecret = body.secret;

    if (typeof suppliedSecret !== "string") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const suppliedBuffer = Buffer.from(suppliedSecret);
    const expectedBuffer = Buffer.from(secret);

    if (
      suppliedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(suppliedBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const signature = createCountrySignature(country, secret);

    const response = NextResponse.json({
      success: true,
      simulatedCountry: country,
      message: "Payment country simulation enabled.",
    });

    response.cookies.set("payment_country_test", `${country}.${signature}`, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 1800,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Payment country simulation disabled.",
  });

  response.cookies.set("payment_country_test", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
