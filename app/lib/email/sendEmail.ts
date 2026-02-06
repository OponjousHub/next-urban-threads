import { resend } from "./resend";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  //   const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  console.log("📨 sendEmail called with:", to);

  const data = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });

  console.log("Resend response:", data);

  return data;
}
