export default function welcomeEmail(name: string) {
  return {
    subject: "Welcome to Urban Threads 🎉",

    html: `
      <div style="font-family: Arial; max-width:600px; margin:auto;">
        <h2>Welcome to Urban Threads, ${name} 👋</h2>

        <p>We’re excited to have you join us.</p>

        <p>
          Discover stylish fashion, track orders, and enjoy seamless shopping.
        </p>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/"
           style="display:inline-block;
                  margin-top:20px;
                  padding:12px 20px;
                  background:black;
                  color:white;
                  text-decoration:none;">
          Start Shopping
        </a>

        <p style="margin-top:30px; font-size:12px; color:#666;">
          Urban Threads Team
        </p>
      </div>
    `,
  };
}
