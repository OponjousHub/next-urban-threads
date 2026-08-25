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

  // =========================================================
  // Verify payment by reference
  // =========================================================

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    try {
      const res = await axios.get(
        `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },

          // Never allow payment verification to block
          // the customer's order page indefinitely.
          timeout: 10000,
        },
      );

      const data = res.data?.data;

      // -------------------------------------------------------
      // No transaction data returned
      // -------------------------------------------------------

      if (!data) {
        return {
          success: false,
          status: "pending",
        };
      }

      const rawStatus = String(data.status ?? "").toLowerCase();

      // -------------------------------------------------------
      // Paystack successful transaction
      // -------------------------------------------------------

      if (rawStatus === "success") {
        return {
          success: true,
          status: "successful",
          transactionId: data.id,
          txRef: data.reference,
        };
      }

      // -------------------------------------------------------
      // Paystack explicitly failed transaction
      // -------------------------------------------------------

      if (
        rawStatus === "failed" ||
        rawStatus === "abandoned" ||
        rawStatus === "cancelled" ||
        rawStatus === "canceled"
      ) {
        return {
          success: false,
          status: "failed",
          transactionId: data.id,
          txRef: data.reference,
        };
      }

      // -------------------------------------------------------
      // Anything else is treated as pending.
      //
      // We don't want to mark an order as failed just because
      // Paystack hasn't reached a terminal state yet.
      // -------------------------------------------------------

      return {
        success: false,
        status: "pending",
        transactionId: data.id,
        txRef: data.reference,
      };
    } catch (error: any) {
      const statusCode = error?.response?.status;

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Paystack verification failed";

      console.warn("Paystack verification warning:", {
        reference,
        statusCode,
        message,
        code: error?.code,
      });

      // -------------------------------------------------------
      // Transaction not found yet
      //
      // This can happen if the customer started checkout but
      // never completed the payment.
      // -------------------------------------------------------

      if (statusCode === 400 || statusCode === 404) {
        return {
          success: false,
          status: "pending",
        };
      }

      // -------------------------------------------------------
      // Timeout
      //
      // We don't know the payment outcome, so keep it pending.
      // -------------------------------------------------------

      if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
        return {
          success: false,
          status: "pending",
        };
      }

      // -------------------------------------------------------
      // Any other provider/network error
      //
      // Do NOT mark the customer's payment as failed merely
      // because our verification request failed.
      // -------------------------------------------------------

      return {
        success: false,
        status: "pending",
      };
    }
  }

  // =========================================================
  // Initialize payment
  // =========================================================

  async initializePayment(
    params: InitializePaymentParams,
  ): Promise<InitializePaymentResponse> {
    const { email, amount, reference, callbackUrl } = params;

    const res = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email,

        // Paystack expects the amount in the smallest
        // currency unit, e.g. kobo for NGN.
        amount: Math.round(amount * 100),

        reference,

        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },

        timeout: 10000,
      },
    );

    const data = res.data?.data;

    if (!data?.authorization_url) {
      throw new Error("Paystack did not return an authorization URL");
    }

    return {
      authorizationUrl: data.authorization_url,
      reference: data.reference,
    };
  }

  // =========================================================
  // Fetch Banks
  // =========================================================

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

  // =========================================================
  // Verify Account
  // =========================================================

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

  // =========================================================
  // Transfer
  // =========================================================

  async transfer(
    recipient: TransferRecipient,
    amount: number,
    narration: string,
  ): Promise<TransferResult> {
    throw new Error("Not implemented yet");
  }
}
