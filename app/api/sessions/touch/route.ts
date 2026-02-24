import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { touchSession } from "@/lib/sessions";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) {
    return NextResponse.json({ ok: false });
  }

  await touchSession(sessionId);

  return NextResponse.json({ ok: true });
}
