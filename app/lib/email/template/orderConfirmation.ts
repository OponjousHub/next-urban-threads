import { formatCurrency } from "@/lib/formatCurrency";
import { Prisma } from "@prisma/client";

type OrderConfirmationTenant = {
  name: string;
  logo: string | null;
  primaryColor: string | null;
  currency: string;
  domain: string | null;
};

type OrderConfirmationOrder = {
  id: string;
  totalAmount: Prisma.Decimal | number;
  currency?: string | null;
  paymentAmount?: Prisma.Decimal | number | null;
  paymentCurrency?: string | null;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export default function orderConfirmationEmail(
  order: OrderConfirmationOrder,
  tenant: OrderConfirmationTenant,
  orderUrl: string,
) {
  const storeName = escapeHtml(tenant.name || "Your Store");
  const currency = tenant.currency as Parameters<typeof formatCurrency>[1];

  const primaryColor = /^#[0-9a-fA-F]{6}$/.test(tenant.primaryColor ?? "")
    ? tenant.primaryColor!
    : "#111827";

  // Original store pricing
  const storeCurrency = (order.currency ?? tenant.currency) as Parameters<
    typeof formatCurrency
  >[1];

  const formattedStoreTotal = formatCurrency(
    Number(order.totalAmount),
    storeCurrency,
  );

  // Actual amount charged by the payment gateway
  const paymentCurrency = (order.paymentCurrency ??
    order.currency ??
    tenant.currency) as Parameters<typeof formatCurrency>[1];

  const paymentAmount = Number(order.paymentAmount ?? order.totalAmount);

  const formattedPaymentAmount = formatCurrency(paymentAmount, paymentCurrency);

  const currenciesDiffer = paymentCurrency !== storeCurrency;
  const logoHtml = tenant.logo
    ? `
      <img
        src="${escapeHtml(tenant.logo)}"
        alt="${storeName}"
        width="140"
        style="display:block;max-width:140px;width:100%;height:auto;margin:0 auto 16px;"
      />
    `
    : "";

  return {
    subject: `Order confirmation - #${order.id}`,

    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="color-scheme" content="light" />
          <title>Order confirmation</title>
        </head>

        <body style="
          margin:0;
          padding:0;
          background-color:#f3f4f6;
          font-family:Arial,Helvetica,sans-serif;
          color:#1f2937;
          -webkit-text-size-adjust:100%;
        ">
          <div style="
            display:none;
            max-height:0;
            overflow:hidden;
            opacity:0;
            color:transparent;
          ">
            Your order has been received by ${storeName}.
          </div>

          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="width:100%;background-color:#f3f4f6;"
          >
            <tr>
              <td align="center" style="padding:24px 12px;">

                <table
                  role="presentation"
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    width:100%;
                    max-width:600px;
                    background-color:#ffffff;
                    border-radius:12px;
                    overflow:hidden;
                  "
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        padding:28px 20px;
                        background-color:${primaryColor};
                        color:#ffffff;
                      "
                    >
                      ${
                        tenant.logo
                          ? logoHtml
                          : `
                            <div style="
                              font-size:22px;
                              font-weight:bold;
                              line-height:1.4;
                              overflow-wrap:anywhere;
                            ">
                              ${storeName}
                            </div>
                          `
                      }
                    </td>
                  </tr>

                  <tr>
                    <td style="
                      padding:28px 24px;
                      font-size:15px;
                      line-height:1.7;
                      overflow-wrap:anywhere;
                      word-break:break-word;
                    ">
                      <h1 style="
                        margin:0 0 16px;
                        font-size:24px;
                        line-height:1.3;
                        color:#111827;
                      ">
                        Thank you for your order!
                      </h1>

                      <p style="margin:0 0 16px;">
                        We've received your order and appreciate your
                        purchase from ${storeName}.
                      </p>

                      <div style="
                        margin:20px 0;
                        padding:18px;
                        border:1px solid #e5e7eb;
                        border-radius:8px;
                        background-color:#f9fafb;
                      ">
                        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                          ORDER NUMBER
                        </p>

                        <p style="
                          margin:0 0 16px;
                          font-size:16px;
                          font-weight:bold;
                          overflow-wrap:anywhere;
                        ">
                          #${escapeHtml(order.id)}
                        </p>

                        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                          AMOUNT PAID
                        </p>

                        <p style="
                          margin:0;
                          font-size:22px;
                          font-weight:bold;
                          color:#111827;
                        ">
                          ${escapeHtml(formattedPaymentAmount)}
                        </p>

                        ${
                          currenciesDiffer
                            ? `
                              <p style="margin:16px 0 8px;color:#6b7280;font-size:13px;">
                                ORIGINAL ORDER TOTAL
                              </p>

                              <p style="
                                margin:0;
                                font-size:15px;
                                font-weight:bold;
                                color:#374151;
                              ">
                                ${escapeHtml(formattedStoreTotal)}
                              </p>
                            `
                            : ""
                        }

                       
                      </div>

                      <p style="margin:20px 0;">
                        You can view your order details using the button below.
                      </p>

                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="margin:24px 0;width:100%;"
                      >
                        <tr>
                          <td align="center">
                            <a
                              href="${escapeHtml(orderUrl)}"
                              style="
                                display:inline-block;
                                box-sizing:border-box;
                                max-width:100%;
                                padding:14px 24px;
                                background-color:${primaryColor};
                                border-radius:6px;
                                color:#ffffff;
                                font-size:15px;
                                font-weight:bold;
                                line-height:1.4;
                                text-align:center;
                                text-decoration:none;
                                overflow-wrap:anywhere;
                              "
                            >
                              View Your Order
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:24px 0 0;">
                        Thank you for choosing ${storeName}.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="
                      padding:20px 16px;
                      border-top:1px solid #e5e7eb;
                      color:#6b7280;
                      font-size:12px;
                      line-height:1.6;
                      overflow-wrap:anywhere;
                    ">
                      <p style="margin:0 0 6px;">
                        ${storeName}
                      </p>

                      <p style="margin:0;">
                        This is an automated order confirmation email.
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
