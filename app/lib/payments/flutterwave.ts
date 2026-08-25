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
          },

          // Never allow payment verification to block
          // the customer's order page indefinitely.
          timeout: 3000,
        },
      );

      const data = res.data?.data;

      const rawStatus = String(data?.status ?? "").toLowerCase();

      let status: "successful" | "failed" | "pending";

      if (rawStatus === "successful") {
        status = "successful";
      } else if (
        rawStatus === "failed" ||
        rawStatus === "cancelled" ||
        rawStatus === "canceled"
      ) {
        status = "failed";
      } else {
        status = "pending";
      }

      return {
        success: status === "successful",
        status,
        transactionId: data?.id,
        txRef: data?.tx_ref,
      };
    } catch (error: any) {
      const statusCode = error?.response?.status;

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Flutterwave verification failed";

      console.warn("Flutterwave verification warning:", {
        statusCode,
        message,
        reference,
      });

      // Transaction does not exist yet.
      // Keep the order pending.
      if (statusCode === 400 || statusCode === 404) {
        return {
          success: false,
          status: "pending",
        };
      }

      // Flutterwave did not respond within our timeout.
      // Do NOT fail the order. We simply don't know yet.
      if (error?.code === "ECONNABORTED") {
        return {
          success: false,
          status: "pending",
        };
      }

      // Genuine API/server/authentication error.
      throw error;
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
