import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { touchSession } from "@/lib/sessions";
import { getCurrentSessionId } from "@/lib/auth";

export async function POST() {
  const currentSessionId = await getCurrentSessionId();

  if (!currentSessionId) {
    return NextResponse.json({ ok: false });
  }

  await touchSession(currentSessionId);

  return NextResponse.json({ ok: true });
}
