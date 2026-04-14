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

// export function ContactSupportEmail({
//   name,
//   email,
//   message,
//   tenantName,
// }: {
//   name: string;
//   email: string;
//   message: string;
//   tenantName: string;
// }) {
//   return {
//     subject: `📩 New Support Message from ${name}`,

//     html: `
//       <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">

//         <!-- Container -->
//         <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden;">

//           <!-- Header -->
//           <div style="background:black; color:white; padding:20px; text-align:center;">
//             <h1 style="margin:0;">${tenantName} Support</h1>
//           </div>

//           <!-- Body -->
//           <div style="padding:30px;">

//             <h2 style="margin-bottom:20px; text-align:center;">
//               New Customer Support Request
//             </h2>

//             <!-- Customer Info Card -->
//             <div style="background:#f9f9f9; padding:15px; border-radius:6px; margin-bottom:20px;">
//               <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${name}</p>
//               <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${email}</p>
//             </div>

//             <!-- Message Box -->
//             <div style="background:white; border:1px solid #eee; padding:15px; border-radius:6px;">
//               <p style="margin:0; white-space:pre-line; color:#333; line-height:1.6;">
//                 ${message}
//               </p>
//             </div>

//             <!-- Reply Hint -->
//             <p style="margin-top:20px; font-size:13px; color:#777; text-align:center;">
//               💡 You can reply directly to this email to respond to the customer.
//             </p>
//           </div>

//           <!-- Divider -->
//           <hr style="border:none; border-top:1px solid #eee;" />

//           <!-- Footer -->
//           <div style="padding:20px; text-align:center; font-size:12px; color:#999;">
//             <p>This message was sent via the ${tenantName} contact support system.</p>
//             <p>© ${new Date().getFullYear()} ${tenantName}</p>
//           </div>

//         </div>
//       </div>
//     `,
//   };
// }
