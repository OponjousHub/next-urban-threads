import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { ContactSupportEmail } from "@/app/lib/email/template/contact-support";
import { sendEmail } from "@/app/lib/email/sendEmail";
import { detectSupportIntent } from "@/app/admin/support/message-priority-detector";

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!tenant.email) {
    return NextResponse.json(
      { error: "Admin email not configured" },
      { status: 500 },
    );
  }

  function autoTag(message: string) {
    const text = message.toLowerCase();

    if (text.includes("refund")) return "REFUND";
    if (text.includes("order")) return "ORDER";
    if (text.includes("bug") || text.includes("error")) return "BUG";

    return "GENERAL";
  }

  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }
    // const tag = autoTag(message);
    const { priority, tag } = detectSupportIntent(message);

    // ✅ Save to DB
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        message,
        priority,
        tag,
        tenant: {
          connect: { id: tenant.id },
        },
      },
    });

    // ✅ FIXED: correct function call (object param)
    const template = await ContactSupportEmail({
      name: contact.name,
      email: contact.email,
      message: contact.message,
      tenantName: tenant.name,
    });

    // ✅ Send to ADMIN (NOT customer)
    await sendEmail({
      to: tenant.email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
