import axios from "axios";

import { PaymentProvider, VerifyPaymentResult } from "@/types/payment";

import {
  VerifyBankAccountResult,
  TransferRecipient,
  TransferResult,
} from "./types";

export class FlutterwaveProvider implements PaymentProvider {
  private baseUrl = "https://api.flutterwave.com/v3";

  // =======================
  // Initialize Payment
  // =======================

  async initializePayment({
    email,
    amount,
    currency,
    reference,
    callbackUrl,
  }: {
    email: string;
    amount: number;
    currency: string;
    reference: string;
    callbackUrl: string;
  }) {
    const res = await axios.post(
      `${this.baseUrl}/payments`,
      {
        tx_ref: reference,
        amount,
        currency,
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

  // =======================
  // Verify Payment
  // =======================

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    try {
      const res = await axios.get(
        `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
          reference,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      const data = res.data?.data;

      console.log("========== FLUTTERWAVE VERIFY ==========");
      console.log("Reference sent:", reference);
      console.log("Flutterwave transaction ID:", data?.id);
      console.log("Flutterwave tx_ref:", data?.tx_ref);
      console.log("Flutterwave status:", data?.status);
      console.log("Flutterwave amount:", data?.amount);
      console.log("Flutterwave currency:", data?.currency);
      console.log("Flutterwave processor response:", data?.processor_response);
      console.log("==========================================");

      // No transaction data returned.
      // This is NOT the same as a real pending transaction.
      if (!data) {
        return {
          success: false,
          status: "not_found",
        };
      }

      const rawStatus = String(data.status ?? "").toLowerCase();

      // ---------------------------
      // Successful
      // ---------------------------

      if (rawStatus === "successful" || rawStatus === "succeeded") {
        return {
          success: true,
          status: "successful",
          transactionId: data.id,
          txRef: data.tx_ref,
        };
      }

      // ---------------------------
      // Failed / cancelled
      // ---------------------------

      if (
        rawStatus === "failed" ||
        rawStatus === "cancelled" ||
        rawStatus === "canceled"
      ) {
        return {
          success: false,
          status: "failed",
          transactionId: data.id,
          txRef: data.tx_ref,
        };
      }

      // ---------------------------
      // Genuine pending transaction
      // ---------------------------

      return {
        success: false,
        status: "pending",
        transactionId: data.id,
        txRef: data.tx_ref,
      };
    } catch (error: any) {
      const statusCode = error?.response?.status;

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Flutterwave verification failed";

      console.warn("========== FLUTTERWAVE VERIFY ERROR ==========");
      console.warn("Reference:", reference);
      console.warn("HTTP status:", statusCode);
      console.warn("Flutterwave error response:", error?.response?.data);
      console.warn("Error code:", error?.code);
      console.warn("Error message:", message);
      console.warn("==============================================");

      // ---------------------------------------------------------
      // No transaction exists.
      //
      // This is what we observed when:
      // 1. Customer abandoned Flutterwave before completing payment
      // 2. Customer pressed Cancel on Flutterwave
      //
      // Flutterwave returned:
      // 400
      // "No transaction was found for this id"
      //
      // Therefore this MUST NOT be treated as pending.
      // ---------------------------------------------------------

      if (
        (statusCode === 400 || statusCode === 404) &&
        String(message).toLowerCase().includes("no transaction")
      ) {
        return {
          success: false,
          status: "not_found",
        };
      }

      // ---------------------------------------------------------
      // Timeout
      //
      // We don't know the payment outcome.
      // Keep the order pending.
      // ---------------------------------------------------------

      if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
        return {
          success: false,
          status: "pending",
        };
      }

      // ---------------------------------------------------------
      // Other Flutterwave/network errors
      //
      // We don't know the payment outcome.
      // Never mark a potentially paid order as failed because
      // of a temporary verification/network problem.
      // ---------------------------------------------------------

      return {
        success: false,
        status: "pending",
      };
    }
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
