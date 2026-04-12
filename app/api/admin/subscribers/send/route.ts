// import { NextResponse } from "next/server";
// import { prisma } from "@/utils/prisma";
// import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
// import { sendEmail } from "@/app/lib/email/sendEmail";
// import { NewsletterEmail } from "@/app/lib/email/template/newsletter";
// import { setProgress } from "@/app/lib/newsletterProgress";

// export async function POST(req: Request) {
//   const tenant = await getDefaultTenant();
//   const { subject, message } = await req.json();

//   if (!tenant) throw new Error("Tenant not found");

//   const subscribers = await prisma.newsletter.findMany({
//     where: { tenantId: tenant.id },
//   });

//   // const template = NewsletterEmail({ subject, message });
//   const template = await NewsletterEmail({
//     subject,
//     message,
//     tenantName: tenant.name,
//     email,
//   });
//   // INIT progress
//   setProgress({
//     total: subscribers.length,
//     sent: 0,
//     status: "sending",
//   });

//   // 🔥 DON'T await → run in background
//   sendInBackground(subscribers, template);

//   return NextResponse.json({ message: "Sending started..." });
// }

// // background function
// async function sendInBackground(subscribers: any[], template: any) {
//   const BATCH_SIZE = 10;
//   const DELAY = 1000;

//   function chunk(arr: any[], size: number) {
//     const res = [];
//     for (let i = 0; i < arr.length; i += size) {
//       res.push(arr.slice(i, i + size));
//     }
//     return res;
//   }

//   function sleep(ms: number) {
//     return new Promise((r) => setTimeout(r, ms));
//   }

//   let sent = 0;
//   const batches = chunk(subscribers, BATCH_SIZE);

//   for (const batch of batches) {
//     await Promise.all(
//       batch.map(async (sub) => {
//         try {
//           const res = await sendEmail({
//             to: sub.email,
//             subject: template.subject,
//             html: template.html,
//           });
//           if (res?.error) {
//             console.error("EMAIL FAILED:", sub.email, res.error);
//           } else {
//             console.log("EMAIL SENT:", sub.email);
//           }

//           sent++;
//           setProgress({ sent });
//         } catch (err) {
//           console.error("EMAIL FAILED:", sub.email, err);
//         }
//       }),
//     );

//     await sleep(DELAY);
//   }

//   setProgress({ status: "done" });
// }
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

  // INIT progress
  setProgress({
    total: subscribers.length,
    sent: 0,
    status: "sending",
  });

  // 🔥 run in background (no await)
  sendInBackground(subscribers, subject, message, tenant.name);

  return NextResponse.json({ message: "Sending started..." });
}

// background function
async function sendInBackground(
  subscribers: any[],
  subject: string,
  message: string,
  tenantName: string,
) {
  const BATCH_SIZE = 5; // safer for resend
  const DELAY = 1500;

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
          // ✅ CREATE TEMPLATE PER USER
          const template = await NewsletterEmail({
            subject,
            message,
            tenantName,
            email: sub.email, // 👈 THIS IS THE KEY
          });

          const res = await sendEmail({
            to: sub.email,
            subject: template.subject,
            html: template.html,
          });

          if (res?.error) {
            console.error("❌ EMAIL FAILED:", sub.email, res.error);
          } else {
            console.log("✅ EMAIL SENT:", sub.email);
          }

          sent++;
          setProgress({ sent });
        } catch (err) {
          console.error("❌ EMAIL ERROR:", sub.email, err);
        }
      }),
    );

    await sleep(DELAY);
  }

  setProgress({ status: "done" });
}
