// export function detectCountry(geo?: { country?: string }) {
//   return geo?.country ?? "US";
// }
import { headers } from "next/headers";

export async function detectCountryFromHeaders() {
  const h = await headers();
  return h.get("x-vercel-ip-country") ?? "US";
}
