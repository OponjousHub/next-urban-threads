export function orderCreatedEmail({
  name,
  orderId,
  amount,
  currency,
}: {
  name: string;
  orderId: string;
  amount: number;
  currency: string;
}) {
  return `
    <h2>Order received 🛒</h2>
    <p>Hello ${name},</p>
    <p>Your order <strong>#${orderId}</strong> was created.</p>
    <p>Total: <strong>${currency} ${amount}</strong></p>
  `;
}
