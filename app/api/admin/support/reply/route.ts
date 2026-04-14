import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/email/sendEmail";

export async function POST(req: Request) {
  const { email, name, message } = await req.json();

  await sendEmail({
    to: email,
    subject: "Support Reply",
    html: `
      <p>Hi ${name},</p>
      <p>${message}</p>
      <br/>
      <p>Best regards,<br/>Support Team</p>
    `,
  });

  return NextResponse.json({ success: true });
}
