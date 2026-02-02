import axios from "axios";
import { PaymentProvider } from "@/types/payment";

export class FlutterwaveProvider implements PaymentProvider {
  private baseUrl = "https://api.flutterwave.com/v3";

  async initializePayment({
    email,
    amount,
    reference,
    callbackUrl,
  }: {
    email: string;
    amount: number;
    reference: string;
    callbackUrl: string;
  }) {
    if (!email) {
      throw new Error("Customer email is required for payment");
    }

    const res = await axios.post(
      `${this.baseUrl}/payments`,
      {
        tx_ref: reference,
        amount: Math.round(amount),
        currency: "NGN", // change dynamically if needed
        redirect_url: callbackUrl,
        customer: {
          email,
        },
        payment_options: "card,banktransfer",
        customizations: {
          title: "Urban Threads",
          description: "Order payment",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      authorizationUrl: res.data.data.link,
      reference,
    };
  }

  async verifyPayment(reference: string): Promise<boolean> {
    const res = await axios.get(
      `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      },
    );

    return res.data.data.status === "successful";
  }
}
