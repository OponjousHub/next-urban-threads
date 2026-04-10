export function NewsletterEmail({
  subject,
  message,
  ctaText = "Shop Now",
  ctaLink = process.env.NEXT_PUBLIC_APP_URL,
}: {
  subject: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
}) {
  return {
    subject,

    html: `
      <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
        
        <!-- Container -->
        <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <div style="background:black; color:white; padding:20px; text-align:center;">
            <h1 style="margin:0;">Urban Threads</h1>
          </div>

          <!-- Hero -->
          <div style="padding:30px; text-align:center;">
            <h2 style="margin-bottom:10px;">${subject}</h2>
            <p style="color:#555; font-size:15px; line-height:1.6;">
              ${message}
            </p>

            <!-- CTA -->
            <a href="${ctaLink}"
              style="
                display:inline-block;
                margin-top:20px;
                padding:12px 24px;
                background:black;
                color:white;
                text-decoration:none;
                border-radius:6px;
                font-weight:bold;
              ">
              ${ctaText}
            </a>
          </div>

          <!-- Divider -->
          <hr style="border:none; border-top:1px solid #eee;" />

          <!-- Optional Promo Section -->
          <div style="padding:20px; text-align:center;">
            <h3 style="margin-bottom:10px;">🔥 Don’t Miss Out</h3>
            <p style="color:#777; font-size:14px;">
              New arrivals, flash deals, and exclusive discounts are waiting for you.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding:20px; text-align:center; font-size:12px; color:#999;">
            <p>© ${new Date().getFullYear()} Urban Threads</p>

            <p style="margin-top:10px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe"
                 style="color:#999; text-decoration:underline;">
                Unsubscribe
              </a>
            </p>
          </div>

        </div>
      </div>
    `,
  };
}
