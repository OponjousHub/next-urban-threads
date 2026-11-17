// import { headers } from "next/headers";

// export async function detectCountryFromHeaders() {
//   const h = await headers();
//   return h.get("x-vercel-ip-country") ?? "US";
// }

import { headers } from "next/headers";

export async function detectCountryFromHeaders() {
  const h = await headers();

  // Temporary country override for controlled payment testing.
  const countryOverride = process.env.PAYMENT_COUNTRY_OVERRIDE?.trim();

  if (countryOverride) {
    return countryOverride.toUpperCase();
  }

  return h.get("x-vercel-ip-country") ?? "US";
}
