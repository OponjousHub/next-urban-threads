type WelcomeEmailTenant = {
  name: string;
  logo: string | null;
  primaryColor: string | null;
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

export default function welcomeEmail(
  name: string,
  tenant: WelcomeEmailTenant,
  storeUrl: string,
) {
  const storeName = escapeHtml(tenant.name || "Your Store");
  const customerName = escapeHtml(name || "there");

  const primaryColor = /^#[0-9a-fA-F]{6}$/.test(tenant.primaryColor ?? "")
    ? tenant.primaryColor!
    : "#111827";

  const logoHtml = tenant.logo
    ? `
      <img
        src="${escapeHtml(tenant.logo)}"
        alt="${storeName}"
        width="140"
        style="display:block;max-width:140px;width:100%;height:auto;margin:0 auto 16px;"
      />
    `
    : `
      <div style="
        font-size:22px;
        font-weight:bold;
        line-height:1.4;
        overflow-wrap:anywhere;
      ">
        ${storeName}
      </div>
    `;

  return {
    subject: `Welcome to ${tenant.name || "Your Store"}!`,

    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="color-scheme" content="light" />
          <title>Welcome</title>
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
            Welcome to ${storeName}. We're glad you're here.
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
                      ${logoHtml}
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
                        Welcome, ${customerName}!
                      </h1>

                      <p style="margin:0 0 16px;">
                        We're excited to welcome you to ${storeName}.
                      </p>

                      <p style="margin:0 0 20px;">
                        You can explore our products, manage your account,
                        and keep track of your orders whenever you need to.
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
                              href="${escapeHtml(storeUrl)}"
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
                              Start Shopping
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:24px 0 0;">
                        Thank you for joining us!
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
                        We're glad you're here.
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
