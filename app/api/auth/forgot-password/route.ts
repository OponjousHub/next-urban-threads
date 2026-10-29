import { getAuthPayload } from "@/lib/server/auth";
import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/email/sendEmail";

import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  const auth = await getAuthPayload();
  const { tenant } = auth;

  if (!tenant) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email, tenantId: tenant.id },
  });

  if (!user) {
    // Always return success to prevent enumeration
    return NextResponse.json({ message: "If email exists, reset link sent" });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id, tenantId: tenant.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}&tenant=${tenant.id}`;

  const tenantName = tenant.name || "RAYNTA";

  const primaryColor =
    tenant.primaryColor && /^#[0-9a-fA-F]{6}$/.test(tenant.primaryColor)
      ? tenant.primaryColor
      : "#111827";

  const logoHtml = tenant.logo
    ? `
    <img
      src="${tenant.logo}"
      alt="${tenantName}"
      width="150"
      style="display:block;max-width:150px;max-height:60px;width:auto;height:auto;margin:0 auto 12px;"
    />
  `
    : "";

  const safeTenantName = tenantName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const safeResetUrl = resetUrl
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  await sendEmail({
    to: user.email,
    subject: `Reset your password - ${tenantName}`,
    category: "security",
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset your password</title>
      </head>

      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="background:#f3f4f6;padding:32px 12px;"
        >
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;"
              >
                <tr>
                  <td
                    align="center"
                    style="background:${primaryColor};padding:28px 20px;color:#ffffff;"
                  >
                    ${logoHtml}

                    <h1 style="margin:0;font-size:24px;line-height:1.4;color:#ffffff;">
                      ${safeTenantName}
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 24px;">
                    <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">
                      Reset your password
                    </h2>

                    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                      We received a request to reset the password for your account.
                    </p>

                    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;">
                      Click the button below to choose a new password.
                      This link expires in <strong>one hour</strong>.
                    </p>

                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      style="margin:0 auto 24px;"
                    >
                      <tr>
                        <td
                          align="center"
                          style="background:${primaryColor};border-radius:6px;"
                        >
                          <a
                            href="${safeResetUrl}"
                            style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;"
                          >
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;font-size:13px;line-height:1.7;color:#4b5563;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>

                    <p style="margin:0 0 24px;font-size:13px;line-height:1.7;overflow-wrap:anywhere;">
                      <a
                        href="${safeResetUrl}"
                        style="color:${primaryColor};"
                      >${safeResetUrl}</a>
                    </p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

                    <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">
                      If you did not request a password reset, you can ignore this email.
                      Your password will remain unchanged.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    align="center"
                    style="padding:20px;background:#f9fafb;font-size:12px;line-height:1.6;color:#6b7280;"
                  >
                    This is an automated account-security email from ${safeTenantName}.
                    Please do not share your reset link with anyone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
  });

  return NextResponse.json({ message: "If email exists, reset link sent" });
}
