import axios from "axios";

export type InitializePaymentParams = {
  email: string; // Customer email
  amount: number; // Amount in Naira
  reference: string; // Unique payment reference (UUID)
  callbackUrl: string; // URL Paystack redirects to after payment
};

export type InitializePaymentResponse = {
  authorizationUrl: string;
  reference: string;
};

export class PaystackProvider {
  private baseUrl = "https://api.paystack.co";

  // Verify payment by reference
  async verifyPayment(reference: string): Promise<boolean> {
    const res = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    // Paystack returns status = 'success' if payment is completed
    return res.data.data.status === "success";
  }

  // Initialize payment
  async initializePayment(
    params: InitializePaymentParams
  ): Promise<InitializePaymentResponse> {
    const { email, amount, reference, callbackUrl } = params;

    const res = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Paystack expects kobo
        reference,
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = res.data.data;

    return {
      authorizationUrl: data.authorization_url,
      reference: data.reference,
    };
  }
}
