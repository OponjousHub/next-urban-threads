import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { sendEmail } from "@/app/lib/email/sendEmail";
import { NewsletterEmail } from "@/app/lib/email/template/newsletter";
import { setProgress } from "@/app/lib/newsletterProgress";

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();
  const { subject, message } = await req.json();

  if (!tenant) throw new Error("Tenant not found");

  const subscribers = await prisma.newsletter.findMany({
    where: { tenantId: tenant.id },
  });

  const template = NewsletterEmail({ subject, message });

  // INIT progress
  setProgress({
    total: subscribers.length,
    sent: 0,
    status: "sending",
  });

  // 🔥 DON'T await → run in background
  sendInBackground(subscribers, template);

  return NextResponse.json({ message: "Sending started..." });
}

// background function
async function sendInBackground(subscribers: any[], template: any) {
  const BATCH_SIZE = 10;
  const DELAY = 1000;

  function chunk(arr: any[], size: number) {
    const res = [];
    for (let i = 0; i < arr.length; i += size) {
      res.push(arr.slice(i, i + size));
    }
    return res;
  }

  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  let sent = 0;
  const batches = chunk(subscribers, BATCH_SIZE);

  for (const batch of batches) {
    await Promise.all(
      batch.map(async (sub) => {
        try {
          await sendEmail({
            to: sub.email,
            subject: template.subject,
            html: template.html,
          });

          sent++;
          setProgress({ sent });
        } catch {}
      }),
    );

    await sleep(DELAY);
  }

  setProgress({ status: "done" });
}

// import { NextResponse } from "next/server";
// import { prisma } from "@/utils/prisma";
// import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
// import { sendEmail } from "@/app/lib/email/sendEmail";
// import { NewsletterEmail } from "@/app/lib/email/template/newsletter";

// // helpers
// function chunkArray<T>(array: T[], size: number) {
//   const result = [];
//   for (let i = 0; i < array.length; i += size) {
//     result.push(array.slice(i, i + size));
//   }
//   return result;
// }

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// export async function POST(req: Request) {
//   const tenant = await getDefaultTenant();
//   if (!tenant) throw new Error("Tenant not found");

//   const { subject, message } = await req.json();

//   if (!subject || !message) {
//     return NextResponse.json(
//       { message: "Subject and message required" },
//       { status: 400 },
//     );
//   }

//   const subscribers = await prisma.newsletter.findMany({
//     where: { tenantId: tenant.id },
//   });

//   const template = NewsletterEmail({ subject, message });

//   const total = subscribers.length;
//   let sent = 0;

//   // ⚡ CONFIG
//   const BATCH_SIZE = 10; // send 10 emails at once
//   const DELAY_MS = 1000; // wait 1s between batches

//   const batches = chunkArray(subscribers, BATCH_SIZE);

//   for (const batch of batches) {
//     // ✅ send batch in parallel
//     await Promise.all(
//       batch.map(async (sub) => {
//         try {
//           await sendEmail({
//             to: sub.email,
//             subject: template.subject,
//             html: template.html,
//           });

//           sent++;
//           console.log(`📨 Sent ${sent}/${total} → ${sub.email}`);
//         } catch (err) {
//           console.error("Failed to send to:", sub.email);
//         }
//       }),
//     );

//     // ⏳ rate limiting
//     await sleep(DELAY_MS);
//   }

//   return NextResponse.json({
//     message: `Emails sent successfully (${sent}/${total})`,
//   });
// }
