import axios from "axios";
import { VerifyPaymentResult } from "@/types/payment";
import {
  Bank,
  VerifyBankAccountResult,
  TransferRecipient,
  TransferResult,
} from "./types";

export type InitializePaymentParams = {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
};

export type InitializePaymentResponse = {
  authorizationUrl: string;
  reference: string;
};

export class PaystackProvider {
  private baseUrl = "https://api.paystack.co";

  // Verify payment by reference
  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    const res = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    const data = res.data?.data;

    return {
      success: data?.status === "success",
      transactionId: data?.id, // optional but good
      txRef: data?.reference,
    };
  }

  // Initialize payment
  async initializePayment(
    params: InitializePaymentParams,
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
      },
    );

    const data = res.data.data;

    return {
      authorizationUrl: data.authorization_url,
      reference: data.reference,
    };
  }

  // =======================
  // Fetch Banks
  // =======================

  async getBanks(): Promise<Bank[]> {
    const res = await axios.get(`${this.baseUrl}/bank`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    return res.data.data.map((bank: any) => ({
      code: bank.code,
      name: bank.name,
    }));
  }

  // =======================
  // Verify Account
  // =======================
  async verifyBankAccount(
    bankCode: string,
    accountNumber: string,
  ): Promise<VerifyBankAccountResult> {
    const res = await axios.get(`${this.baseUrl}/bank/resolve`, {
      params: {
        account_number: accountNumber,
        bank_code: bankCode,
      },
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    return {
      accountName: res.data.data.account_name,
    };
  }

  // =======================
  // Verify Account
  // =======================
  async transfer(
    recipient: TransferRecipient,
    amount: number,
    narration: string,
  ): Promise<TransferResult> {
    throw new Error("Not implemented yet");
  }
}
