import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: Request) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Default tenant not found" },
        { status: 404 },
      );
    }

    const body = await req.json();

    const sessionKey = body?.sessionKey;

    if (!sessionKey || typeof sessionKey !== "string") {
      return NextResponse.json(
        { message: "sessionKey is required" },
        { status: 400 },
      );
    }

    /*
     * We intentionally do NOT require a userId.
     *
     * Storefront visitors can be guests.
     *
     * The session is scoped by:
     *   tenant + storeMode + sessionKey
     */
    const existingSession = await prisma.storefrontSession.findUnique({
      where: {
        tenantId_storeMode_sessionKey: {
          tenantId: tenant.id,
          storeMode: tenant.storeMode,
          sessionKey,
        },
      },
    });

    if (existingSession) {
      const updatedSession = await prisma.storefrontSession.update({
        where: {
          id: existingSession.id,
        },
        data: {
          lastSeenAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        sessionId: updatedSession.id,
        existing: true,
      });
    }

    /*
     * Create a new storefront session.
     *
     * We don't attach a user here because the visitor may
     * be anonymous. We can associate the user later when
     * authentication information is available.
     */
    const session = await prisma.storefrontSession.create({
      data: {
        sessionKey,
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      existing: false,
    });
  } catch (error) {
    console.error("Storefront session tracking failed:", error);

    return NextResponse.json(
      {
        message: "Failed to track storefront session",
      },
      {
        status: 500,
      },
    );
  }
}
