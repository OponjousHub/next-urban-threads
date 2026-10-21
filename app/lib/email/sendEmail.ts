import { resend } from "./resend";

export async function sendEmail({
  to,
  subject,
  html,
  idempotencyKey,
}: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey?: string;
}) {
  const { data, error } = await resend.emails.send(
    {
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );

  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  return data;
}
