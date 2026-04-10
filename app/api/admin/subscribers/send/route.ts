import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { sendEmail } from "@/app/lib/email/sendEmail";
import { NewsletterEmail } from "@/app/lib/email/template/newsletter";

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

  // ✅ FIX 1: correct function call
  const template = NewsletterEmail({
    subject,
    message,
  });

  for (const sub of subscribers) {
    await sendEmail({
      to: sub.email,
      subject: template.subject, // ✅ use from template
      html: template.html, // ✅ FIX 2
    });
  }

  return NextResponse.json({ message: "Emails sent successfully" });
}
