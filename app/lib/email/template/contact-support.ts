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
  return {
    subject: isReply
      ? `Reply from ${tenantName} Support`
      : `New Support Message from ${name}`,

    html: `
      <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
        
        <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <div style="background:black; color:white; padding:20px; text-align:center;">
            <h1 style="margin:0;">${tenantName}</h1>
          </div>

          <!-- Content -->
          <div style="padding:30px;">
            ${
              isReply
                ? `
                <p>Hi ${name},</p>
                <p style="margin-top:10px;">${message}</p>
                <p style="margin-top:20px;">If you need further help, feel free to reply to this email.</p>
                `
                : `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p style="margin-top:15px;">${message}</p>
                `
            }
          </div>

          <!-- Footer -->
          <div style="padding:20px; text-align:center; font-size:12px; color:#999;">
            <p>© ${new Date().getFullYear()} ${tenantName}</p>
          </div>

        </div>
      </div>
    `,
  };
}
