type NewsletterEmailTenant = {
  name: string;
  logo: string | null;
  primaryColor: string | null;
};

type NewsletterEmailOptions = {
  subject: string;
  message: string;
  tenant: NewsletterEmailTenant;
  email: string;
  ctaText?: string;
  ctaLink?: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&",
      "<": "<",
      ">": ">",
      '"': "",
      "'": "'",
    };

    return entities[character];
  });
}

function safeUrl(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export async function NewsletterEmail({
  subject,
  message,
  tenant,
  email,
  ctaText = "Shop Now",
  ctaLink = process.env.NEXT_PUBLIC_APP_URL,
}: NewsletterEmailOptions) {
  const storeName = escapeHtml(tenant.name || "Your Store");
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r\n|\r|\n/g, "<br />");
  const safeCtaText = escapeHtml(ctaText);

  const primaryColor = /^#[0-9a-fA-F]{6}$/.test(tenant.primaryColor ?? "")
    ? tenant.primaryColor!
    : "#111827";

  const validCtaLink = safeUrl(ctaLink);
  const validLogo = safeUrl(tenant.logo ?? undefined);

  const logoHtml = validLogo
    ? `<img src="${escapeHtml(validLogo)}" alt="${storeName}" width="140" style="display:block;max-width:140px;width:100%;height:auto;margin:0 auto;" />`
    : `<div style="font-size:22px;font-weight:bold;line-height:1.4;overflow-wrap:anywhere;">${storeName}</div>`;

  const unsubscribeUrl = safeUrl(process.env.NEXT_PUBLIC_APP_URL);

  const unsubscribeLink = unsubscribeUrl
    ? `${unsubscribeUrl.replace(/\/+$/, "")}/unsubscribe?email=${encodeURIComponent(email)}`
    : null;

  return {
    subject,

    html: `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light" />
      <title>${safeSubject}</title>
    </head>

    <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;-webkit-text-size-adjust:100%;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        ${safeSubject}
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f3f4f6;">
        <tr>
          <td align="center" style="padding:24px 12px;">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
              <tr>
                <td align="center" style="padding:28px 20px;background-color:${primaryColor};color:#ffffff;">
                  ${logoHtml}
                </td>
              </tr>

              <tr>
                <td style="padding:28px 24px;font-size:15px;line-height:1.7;overflow-wrap:anywhere;word-break:break-word;">
                  <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#111827;">
                    ${safeSubject}
                  </h1>

                  <div style="color:#4b5563;font-size:15px;line-height:1.8;">
                    ${safeMessage}
                  </div>

                  ${
                    validCtaLink
                      ? `
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;width:100%;">
                          <tr>
                            <td align="center">
                              <a href="${escapeHtml(validCtaLink)}" style="display:inline-block;box-sizing:border-box;max-width:100%;padding:14px 24px;background-color:${primaryColor};border-radius:6px;color:#ffffff;font-size:15px;font-weight:bold;line-height:1.4;text-align:center;text-decoration:none;overflow-wrap:anywhere;">
                                ${safeCtaText}
                              </a>
                            </td>
                          </tr>
                        </table>
                      `
                      : ""
                  }

                  <p style="margin:24px 0 0;color:#6b7280;font-size:13px;">
                    Thank you for staying connected with ${storeName}.
                  </p>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:20px 16px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.6;overflow-wrap:anywhere;">
                  <p style="margin:0 0 10px;">&copy; ${new Date().getFullYear()} ${storeName}</p>

                  ${
                    unsubscribeLink
                      ? `
                        <p style="margin:0;">
                          <a href="${escapeHtml(unsubscribeLink)}" style="color:#6b7280;text-decoration:underline;">
                            Unsubscribe
                          </a>
                        </p>
                      `
                      : ""
                  }
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`,
  };
}
