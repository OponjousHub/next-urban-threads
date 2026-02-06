export default function changeEmailVerificationTemplate(url: string) {
  return {
    subject: "Confirm your new email - Urban Threads",

    html: `
      <h2>Email Change Request</h2>
      <p>Click below to confirm your new email address:</p>
      <a href="${url}">Confirm Email</a>
    `,
  };
}
