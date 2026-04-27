import axios from "axios";
import { PaymentProvider } from "@/types/payment";

type VerifyResponse = {
  success: boolean;
  transactionId?: number;
  txRef?: string;
};

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
    const res = await axios.post(
      `${this.baseUrl}/payments`,
      {
        tx_ref: reference,
        amount: Math.round(amount),
        currency: "NGN",
        redirect_url: callbackUrl,
        customer: { email },
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

  // ✅ FIXED RETURN TYPE
  async verifyPayment(reference: string): Promise<VerifyResponse> {
    const res = await axios.get(
      `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      },
    );

    const data = res.data?.data;

    return {
      success: data?.status === "successful",
      transactionId: data?.id, // 🔥 REQUIRED FOR REFUNDS
      txRef: data?.tx_ref,
    };
  }
}
