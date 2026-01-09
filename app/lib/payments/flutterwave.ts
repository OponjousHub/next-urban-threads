import axios from "axios";
import { PaymentProvider } from "@/types/payment";

export class FlutterwaveProvider implements PaymentProvider {
  private baseUrl = "https://api.flutterwave.com/v3";
  private secret = process.env.FLUTTERWAVE_SECRET_KEY!;

  async initializePayment(payload: any) {
    const res = await axios.post(
      `${this.baseUrl}/payments`,
      {
        tx_ref: payload.orderId,
        amount: payload.amount,
        currency: payload.currency,
        redirect_url: `${process.env.APP_URL}/payment/verify`,
        customer: {
          email: payload.email,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.secret}`,
        },
      }
    );

    return {
      authorizationUrl: res.data.data.link,
      reference: payload.orderId,
    };
  }

  async verifyPayment(reference: string) {
    const res = await axios.get(
      `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.secret}`,
        },
      }
    );

    return res.data.data.status === "successful";
  }
}
