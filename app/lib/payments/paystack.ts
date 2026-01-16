// import axios from "axios";
// import { PaymentProvider } from "@/types/payment";

// export class PaystackProvider implements PaymentProvider {
//   private baseUrl = "https://api.paystack.co";
//   private secret = process.env.PAYSTACK_SECRET_KEY!;

//   async initializePayment(payload: {
//     email: string;
//     amount: number;
//     orderId: string;
//   }) {
//     const res = await axios.post(
//       `${this.baseUrl}/transaction/initialize`,
//       {
//         email: payload.email,
//         amount: payload.amount * 100,
//         reference: payload.orderId,
//         callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/order/${payload.orderId}`,

//         // (Optional but recommended)
//         metadata: {
//           orderId: payload.orderId,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${this.secret}`,
//         },
//       }
//     );

//     return {
//       authorizationUrl: res.data.data.authorization_url,
//       reference: payload.orderId,
//     };
//   }

//   async verifyPayment(reference: string) {
//     const res = await axios.get(
//       `${this.baseUrl}/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${this.secret}`,
//         },
//       }
//     );

//     return res.data.data.status === "success";
//   }
// }

// app/lib/payments/paystack.ts
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
