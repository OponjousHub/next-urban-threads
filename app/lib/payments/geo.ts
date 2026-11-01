// import { headers } from "next/headers";

// export async function detectCountryFromHeaders() {
//   const h = await headers();
//   return h.get("x-vercel-ip-country") ?? "US";
// }

import { createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";

function createCountrySignature(country: string, secret: string) {
  return createHmac("sha256", secret).update(country).digest("hex");
}

export async function detectCountryFromHeaders() {
  const secret = process.env.PAYMENT_COUNTRY_TEST_SECRET;
  const allowedCountry = process.env.PAYMENT_COUNTRY_TEST;

  if (secret && allowedCountry) {
    const cookieStore = await cookies();
    const testCookie = cookieStore.get("payment_country_test")?.value;

    if (testCookie) {
      const [country, signature] = testCookie.split(".");

      if (country === allowedCountry && signature) {
        const expected = createCountrySignature(country, secret);

        const suppliedBuffer = Buffer.from(signature, "hex");
        const expectedBuffer = Buffer.from(expected, "hex");

        if (
          suppliedBuffer.length === expectedBuffer.length &&
          timingSafeEqual(suppliedBuffer, expectedBuffer)
        ) {
          return country;
        }
      }
    }
  }

  const h = await headers();
  return h.get("x-vercel-ip-country") ?? "US";
}
