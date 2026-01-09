import axios from "axios";
import { PaymentProvider } from "@/types/payment";

export class PaystackProvider implements PaymentProvider {
  private baseUrl = "https://api.paystack.co";
  private secret = process.env.PAYSTACK_SECRET_KEY!;

  async initializePayment(payload: any) {
    const res = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email: payload.email,
        amount: payload.amount * 100,
        reference: payload.orderId,
      },
      {
        headers: {
          Authorization: `Bearer ${this.secret}`,
        },
      }
    );

    return {
      authorizationUrl: res.data.data.authorization_url,
      reference: res.data.data.reference,
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
