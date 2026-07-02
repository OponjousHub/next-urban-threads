import axios from "axios";
import { PaymentProvider } from "@/types/payment";
import {
  Bank,
  VerifyBankAccountResult,
  TransferRecipient,
  TransferResult,
} from "./types";

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

  // =======================
  // Verify Account
  // =======================

  async verifyBankAccount(
    bankCode: string,
    accountNumber: string,
  ): Promise<VerifyBankAccountResult> {
    const res = await axios.post(
      `${this.baseUrl}/accounts/resolve`,
      {
        account_number: accountNumber,
        account_bank: bankCode,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      },
    );

    return {
      accountName: res.data.data.account_name,
    };
  }

  // ==============================
  // Fetch Supported Banks
  // ==============================

  async getBanks(country: string) {
    const res = await axios.get(`${this.baseUrl}/banks/${country}`, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    });

    return res.data.data.map((bank: { code: string; name: string }) => ({
      code: bank.code,
      name: bank.name,
    }));
  }

  // =======================
  // Transfer
  // =======================
  async transfer(
    recipient: TransferRecipient,
    amount: number,
    narration: string,
  ): Promise<TransferResult> {
    throw new Error("Not implemented yet");
  }
}
