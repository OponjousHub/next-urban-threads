import axios from "axios";
import { PaymentProvider } from "@/types/payment";

export class PaystackProvider implements PaymentProvider {
  private baseUrl = "https://api.paystack.co";
  private secret = process.env.PAYSTACK_SECRET_KEY!;

  async initializePayment(payload: {
    email: string;
    amount: number;
    orderId: string;
  }) {
    const res = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email: payload.email,
        amount: payload.amount * 100,
        reference: payload.orderId,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${payload.orderId}`,

        // (Optional but recommended)
        metadata: {
          orderId: payload.orderId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.secret}`,
        },
      }
    );

    return {
      authorizationUrl: res.data.data.authorization_url,
      reference: payload.orderId,
    };
  }

  async verifyPayment(reference: string) {
    const res = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.secret}`,
        },
      }
    );

    return res.data.data.status === "success";
  }
}
