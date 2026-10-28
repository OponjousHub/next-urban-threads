import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { sendEmail } from "@/app/lib/email/sendEmail";
import { NewsletterEmail } from "@/app/lib/email/template/newsletter";
import { setProgress } from "@/app/lib/newsletterProgress";

export async function POST(req: Request) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const body = await req.json();
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required." },
        { status: 400 },
      );
    }

    const subscribers = await prisma.newsletter.findMany({
      where: { tenantId: tenant.id },
      select: { email: true },
    });

    if (subscribers.length === 0) {
      setProgress({
        total: 0,
        sent: 0,
        status: "done",
      });

      return NextResponse.json({
        message: "There are no newsletter subscribers to email.",
        total: 0,
        sent: 0,
        failed: 0,
      });
    }

    setProgress({
      total: subscribers.length,
      sent: 0,
      status: "sending",
    });

    const result = await sendInBatches(subscribers, subject, message, tenant);

    setProgress({ status: "done" });

    return NextResponse.json({
      message:
        result.failed === 0
          ? "Newsletter sending completed successfully."
          : "Newsletter sending completed with some failures.",
      total: subscribers.length,
      sent: result.sent,
      failed: result.failed,
      failures: result.failures.slice(0, 10),
    });
  } catch (error) {
    console.error("NEWSLETTER SEND ERROR:", error);

    setProgress({ status: "error" });

    return NextResponse.json(
      { error: "Unable to send the newsletter. Check the server logs." },
      { status: 500 },
    );
  }
}

type NewsletterSubscriber = {
  email: string;
};

type NewsletterTenant = {
  id: string;
  name: string;
  logo: string | null;
  primaryColor: string | null;
};

async function sendInBatches(
  subscribers: NewsletterSubscriber[],
  subject: string,
  message: string,
  tenant: NewsletterTenant,
) {
  const BATCH_SIZE = 5;
  const DELAY = 1500;

  let sent = 0;
  let failed = 0;

  const failures: { email: string; error: string }[] = [];

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (subscriber) => {
        try {
          const template = await NewsletterEmail({
            subject,
            message,
            tenant,
            email: subscriber.email,
          });

          await sendEmail({
            to: subscriber.email,
            subject: template.subject,
            html: template.html,
          });

          sent++;
          setProgress({ sent });

          console.log("NEWSLETTER EMAIL SENT:", subscriber.email);
        } catch (error) {
          failed++;

          const errorMessage =
            error instanceof Error ? error.message : "Unknown email error";

          failures.push({
            email: subscriber.email,
            error: errorMessage,
          });

          console.error(
            "NEWSLETTER EMAIL FAILED:",
            subscriber.email,
            errorMessage,
          );
        }
      }),
    );

    if (i + BATCH_SIZE < subscribers.length) {
      await sleep(DELAY);
    }
  }

  return { sent, failed, failures };
}
