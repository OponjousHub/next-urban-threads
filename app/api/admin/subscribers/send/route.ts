import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { sendEmail } from "@/app/lib/email/sendEmail";

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Tenant not found");

  const { subject, message } = await req.json();

  if (!subject || !message) {
    return NextResponse.json(
      { message: "Subject and message required" },
      { status: 400 },
    );
  }

  const subscribers = await prisma.newsletter.findMany({
    where: { tenantId: tenant.id },
  });

  // ⚠️ IMPORTANT: avoid sending 1000 emails at once
  for (const sub of subscribers) {
    await sendEmail({
      to: sub.email,
      subject,
      html: `
        <div>
          <h2>${subject}</h2>
          <p>${message}</p>
        </div>
      `,
    });
  }

  return NextResponse.json({ message: "Emails sent successfully" });
}
