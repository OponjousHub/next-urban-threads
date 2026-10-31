type MerchantPaymentEmailData = {
  storeName: string;
  logo?: string | null;
  primaryColor?: string | null;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  originalOrderTotal?: string;
  paymentReference: string;
  paymentProvider: string;
  paymentDate: string;
  orderUrl: string;
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

export default function merchantPaymentReceivedEmail(
  data: MerchantPaymentEmailData,
) {
  const storeName = escapeHtml(data.storeName);
  const orderReference = escapeHtml(data.orderReference);
  const customerName = escapeHtml(data.customerName);
  const customerEmail = escapeHtml(data.customerEmail);
  const amount = escapeHtml(data.amount);
  const originalOrderTotal = data.originalOrderTotal
    ? escapeHtml(data.originalOrderTotal)
    : null;
  const paymentReference = escapeHtml(data.paymentReference);
  const paymentProvider = escapeHtml(data.paymentProvider);
  const paymentDate = escapeHtml(data.paymentDate);
  const orderUrl = escapeHtml(data.orderUrl);

  const color =
    data.primaryColor && /^#[0-9a-f]{3,8}$/i.test(data.primaryColor)
      ? data.primaryColor
      : "#111827";

  const logo = data.logo
    ? `<img src="${escapeHtml(data.logo)}" alt="${storeName}" style="max-width:160px;max-height:65px;object-fit:contain;margin-bottom:20px;" />`
    : `<h1 style="margin:0 0 20px;color:${color};font-size:25px;">${storeName}</h1>`;

  return {
    subject: `Payment Received — Order ${data.orderReference}`,
    html: ` <!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>Payment Received</title> </head> <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;"> <div style="display:none;max-height:0;overflow:hidden;">
A customer payment has been received by ${storeName}. </div>


      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:32px 28px 24px;">
                  ${logo}

                  <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:18px;margin-bottom:24px;">
                    <p style="margin:0 0 8px;color:#047857;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">
                      Payment Successful
                    </p>
                  <h2 style="margin:0;color:#065f46;font-size:27px;overflow-wrap:anywhere;">
  ${amount}
</h2>

${
  originalOrderTotal
    ? `
      <p style="
        margin:6px 0 0;
        color:#047857;
        font-size:12px;
        font-weight:normal;
      ">
        Original order total: ${originalOrderTotal}
      </p>
    `
    : ""
}
                    <p style="margin:8px 0 0;color:#065f46;font-size:14px;">
                      Your store has received a customer payment.
                    </p>
                  </div>

                  <h2 style="font-size:18px;margin:0 0 14px;">Transaction Details</h2>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;border-collapse:collapse;">
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Order Reference</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-weight:bold;overflow-wrap:anywhere;">${orderReference}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Customer</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #e5e7eb;overflow-wrap:anywhere;">${customerName}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Customer Email</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #e5e7eb;overflow-wrap:anywhere;">${customerEmail}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Payment Provider</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #e5e7eb;">${paymentProvider}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Transaction Reference</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #e5e7eb;overflow-wrap:anywhere;">${paymentReference}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;color:#6b7280;">Payment Date</td>
                      <td align="right" style="padding:12px 0;">${paymentDate}</td>
                    </tr>
                  </table>

                  <div style="text-align:center;margin:28px 0 20px;">
                    <a href="${orderUrl}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;padding:14px 25px;border-radius:7px;font-size:14px;font-weight:bold;">
                      View Order in Dashboard
                    </a>
                  </div>

                  <p style="font-size:12px;color:#6b7280;line-height:1.6;margin:24px 0 0;">
                    This is an automated payment notification from ${storeName}.
                    Payment status was confirmed by your store's payment verification process.
                  </p>
                </td>
              </tr>
            </table>

            <p style="font-size:11px;color:#9ca3af;text-align:center;margin:18px 0 0;">
              &copy; ${new Date().getFullYear()} ${storeName}
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>`,
  };
}
