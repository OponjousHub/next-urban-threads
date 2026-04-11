// /api/admin/subscribers/progress/route.ts

import { NextResponse } from "next/server";
import { getProgress } from "@/app/lib/newsletterProgress";

export async function GET() {
  return NextResponse.json(getProgress());
}
