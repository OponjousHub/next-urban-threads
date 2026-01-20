import nodemailer from "nodemailer";
import Mailgun from "mailgun.js";
import formData from "form-data";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

async function sendWithMailtrap(input: SendEmailInput) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}

async function sendWithMailgun(input: SendEmailInput) {
  const mailgun = new Mailgun(formData);
  const client = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY!,
  });

  return client.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: process.env.EMAIL_FROM!,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}

export async function sendEmail(input: SendEmailInput) {
  try {
    if (process.env.EMAIL_PROVIDER === "mailgun") {
      return await sendWithMailgun(input);
    }

    return await sendWithMailtrap(input);
  } catch (error) {
    console.error("Email failed:", error);
  }
}
