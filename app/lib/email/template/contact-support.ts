function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "")
    .replace(/'/g, "'");
}

function formatMessage(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />");
}

export function ContactSupportEmail({
  name,
  email,
  message,
  tenantName,
  isReply = false,
}: {
  name: string;
  email: string;
  message: string;
  tenantName: string;
  isReply?: boolean;
}) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeTenantName = escapeHtml(tenantName);
  const safeMessage = formatMessage(message);

  const subject = isReply
    ? `Reply from ${tenantName} Support`
    : `New Support Message from ${name}`;

  const content = isReply
    ? ` <p style="margin:0 0 20px;color:#1f2937;font-size:16px;line-height:1.7;">
Hello ${safeName}, </p>

  <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.8;overflow-wrap:anywhere;">
    ${safeMessage}
  </p>

  <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.7;">
    If you need further assistance, you can reply to this email.
  </p>
`
    : `
  <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
    A new support message has been submitted.
  </p>

  <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 24px;">
    <tr>
      <td style="padding:12px;background:#f9fafb;border:1px solid #e5e7eb;width:100px;color:#6b7280;font-size:13px;font-weight:bold;">
        Name
      </td>
      <td style="padding:12px;border:1px solid #e5e7eb;color:#111827;font-size:14px;overflow-wrap:anywhere;">
        ${safeName}
      </td>
    </tr>
    <tr>
      <td style="padding:12px;background:#f9fafb;border:1px solid #e5e7eb;color:#6b7280;font-size:13px;font-weight:bold;">
        Email
      </td>
      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;overflow-wrap:anywhere;">
        ${safeEmail}
      </td>
    </tr>
  </table>

  <h3 style="margin:0 0 12px;color:#111827;font-size:16px;">
    Customer message
  </h3>

  <div style="padding:18px;background:#f9fafb;border-left:4px solid #2563eb;border-radius:4px;color:#374151;font-size:15px;line-height:1.8;overflow-wrap:anywhere;">
    ${safeMessage}
  </div>
`;

  return {
    subject,
    html: ` <!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>${escapeHtml(subject)}</title> </head>

    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        ${
          isReply
            ? `A response from ${safeTenantName} Support.`
            : `A new customer support message for ${safeTenantName}.`
        }
      </div>

      <table role="presentation" style="width:100%;border-collapse:collapse;background:#f3f4f6;">
        <tr>
          <td align="center" style="padding:28px 12px;">
            <table role="presentation" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:28px 24px;background:#111827;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:25px;font-weight:700;letter-spacing:0.3px;">
                    ${safeTenantName}
                  </h1>
                  <p style="margin:8px 0 0;color:#d1d5db;font-size:13px;">
                    Customer Support
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:30px 24px;">
                  <h2 style="margin:0 0 22px;color:#111827;font-size:21px;line-height:1.4;">
                    ${isReply ? "We've responded to your message" : "New support message"}
                  </h2>

                  ${content}
                </td>
              </tr>

              <tr>
                <td style="padding:20px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="margin:0 0 6px;color:#6b7280;font-size:12px;line-height:1.6;">
                    Thank you for contacting ${safeTenantName}.
                  </p>
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    &copy; ${new Date().getFullYear()} ${safeTenantName}. All rights reserved.
                  </p>
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
