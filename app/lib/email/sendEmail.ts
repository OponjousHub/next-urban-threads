import { resend } from "./resend";

export type EmailCategory =
  | "default"
  | "orders"
  | "support"
  | "security"
  | "news";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  idempotencyKey?: string;
  category?: EmailCategory;
};

const CATEGORY_ENV_VARS: Record<EmailCategory, string> = {
  default: "EMAIL_FROM_DEFAULT",
  orders: "EMAIL_FROM_ORDERS",
  support: "EMAIL_FROM_SUPPORT",
  security: "EMAIL_FROM_SECURITY",
  news: "EMAIL_FROM_NEWS",
};

export async function sendEmail({
  to,
  subject,
  html,
  idempotencyKey,
  category = "default",
}: SendEmailOptions) {
  const categoryFrom = process.env[CATEGORY_ENV_VARS[category]]?.trim();

  const from =
    categoryFrom ||
    process.env.EMAIL_FROM_DEFAULT?.trim() ||
    process.env.EMAIL_FROM?.trim();

  if (!from) {
    throw new Error(
      `Email sender is not configured. Set ${CATEGORY_ENV_VARS[category]} or EMAIL_FROM.`,
    );
  }

  const { data, error } = await resend.emails.send(
    {
      from,
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
