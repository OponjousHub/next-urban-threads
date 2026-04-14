import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/email/sendEmail";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { ContactSupportEmail } from "@/app/lib/email/template/contact-support";

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, name, message } = await req.json();

    if (!email || !name || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // ✅ Use template in REPLY mode
    const template = ContactSupportEmail({
      name,
      email,
      message,
      tenantName: tenant.name,
      isReply: true,
    });

    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 },
    );
  }
}
