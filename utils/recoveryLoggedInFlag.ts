import { cookies } from "next/headers";

export async function getRecoveryLoginFlag(): Promise<{
  remaining: number;
} | null> {
  const cookieStore = await cookies();
  const notice = cookieStore.get("recovery_notice")?.value;

  if (!notice) return null;

  try {
    return JSON.parse(notice);
  } catch {
    return null;
  }
}
