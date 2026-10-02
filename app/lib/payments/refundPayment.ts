type RefundInput = {
  amount: number;
  reference: string;
  provider: "PAYSTACK" | "FLUTTERWAVE";
  flutterwaveTransactionId?: string | null;
};

export type RefundPaymentResult = {
  success: boolean;
  provider: string;
  reference?: string;
};

/* ==================================================
   MAIN REFUND DISPATCHER
================================================== */

export async function refundPayment({
  amount,
  reference,
  provider,
  flutterwaveTransactionId,
}: RefundInput): Promise<RefundPaymentResult> {
  /*
   * Always convert the amount to a real number.
   *
   * This protects us from Prisma Decimal values being
   * passed through to JSON.stringify().
   */
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    console.error("INVALID REFUND AMOUNT:", {
      amount,
      numericAmount,
      reference,
      provider,
    });

    return {
      success: false,
      provider: String(provider).toLowerCase(),
    };
  }

  /*
   * Flutterwave v3 expects an integer amount.
   */
  if (!Number.isInteger(numericAmount)) {
    console.error("REFUND AMOUNT MUST BE AN INTEGER:", {
      amount,
      numericAmount,
      reference,
      provider,
    });

    return {
      success: false,
      provider: String(provider).toLowerCase(),
    };
  }

  if (provider === "PAYSTACK") {
    return refundPaystack(numericAmount, reference);
  }

  if (provider === "FLUTTERWAVE") {
    if (!flutterwaveTransactionId) {
      console.error(
        "Missing Flutterwave transaction ID for refund:",
        reference,
      );

      return {
        success: false,
        provider: "flutterwave",
      };
    }

    return refundFlutterwave(numericAmount, String(flutterwaveTransactionId));
  }

  return {
    success: false,
    provider: String(provider),
  };
}

/* ==================================================
   PAYSTACK
================================================== */

async function refundPaystack(
  amount: number,
  reference: string,
): Promise<RefundPaymentResult> {
  try {
    const res = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: reference,
        amount: amount * 100, // Kobo
      }),
    });

    const data = await res.json();

    console.log("PAYSTACK REFUND RESPONSE:", {
      statusCode: res.status,
      response: data,
    });

    if (!res.ok || data.status !== true) {
      console.error("PAYSTACK REFUND FAILED:", {
        statusCode: res.status,
        response: data,
      });

      return {
        success: false,
        provider: "paystack",
      };
    }

    return {
      success: true,
      provider: "paystack",
      reference:
        data?.data?.reference != null ? String(data.data.reference) : undefined,
    };
  } catch (error) {
    console.error("PAYSTACK REFUND ERROR:", error);

    return {
      success: false,
      provider: "paystack",
    };
  }
}

/* ==================================================
   FLUTTERWAVE
================================================== */

async function refundFlutterwave(
  amount: number,
  transactionId: string,
): Promise<RefundPaymentResult> {
  try {
    const url = `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
      transactionId,
    )}/refund`;

    const requestBody = {
      amount,
      comments: "Urban Threads customer refund",
    };

    console.log("========== FLUTTERWAVE REFUND REQUEST ==========");
    console.log("Transaction ID:", transactionId);
    console.log("Refund amount:", amount);
    console.log("Request URL:", url);
    console.log("Request body:", requestBody);
    console.log("=================================================");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const rawResponse = await res.text();

    console.log("FLUTTERWAVE REFUND HTTP STATUS:", res.status);
    console.log("FLUTTERWAVE REFUND RAW RESPONSE:", rawResponse);

    let data: any;

    try {
      data = JSON.parse(rawResponse);
    } catch {
      console.error(
        "FLUTTERWAVE REFUND RESPONSE WAS NOT VALID JSON:",
        rawResponse,
      );

      return {
        success: false,
        provider: "flutterwave",
      };
    }

    console.log("FLUTTERWAVE REFUND RESPONSE:", data);

    /*
     * Flutterwave can return useful information either
     * in `message` or inside `data`.
     */
    const responseMessage =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.data === "string"
          ? data.data
          : "";

    /*
     * Some Flutterwave responses indicate that the
     * transaction has already been completely refunded.
     *
     * Treat that as successful from Urban Threads'
     * perspective because the customer's money has
     * already been returned.
     */
    const normalizedMessage = responseMessage.toLowerCase();

    const isAlreadyRefunded =
      normalizedMessage.includes("already fully refunded") ||
      normalizedMessage.includes("already refunded");

    if (isAlreadyRefunded) {
      console.log("FLUTTERWAVE: Transaction was already refunded.");

      return {
        success: true,
        provider: "flutterwave",
        reference: "already_refunded",
      };
    }

    /*
     * Normal successful refund.
     */
    if (res.ok && data?.status === "success") {
      const refundReference =
        data?.data?.id ?? data?.data?.flw_ref ?? data?.data?.reference;

      console.log("========== FLUTTERWAVE REFUND SUCCESS ==========");
      console.log("Refund ID:", data?.data?.id);
      console.log("Flutterwave refund reference:", data?.data?.flw_ref);
      console.log("Amount refunded:", data?.data?.amount_refunded);
      console.log("Refund status:", data?.data?.status);
      console.log("=================================================");

      return {
        success: true,
        provider: "flutterwave",
        reference:
          refundReference != null ? String(refundReference) : undefined,
      };
    }

    /*
     * Gateway rejected the refund.
     */
    console.error("FLUTTERWAVE REFUND FAILED:", {
      statusCode: res.status,
      response: data,
      transactionId,
      amount,
      message: responseMessage,
    });

    return {
      success: false,
      provider: "flutterwave",
    };
  } catch (error) {
    console.error("FLUTTERWAVE REFUND REQUEST ERROR:", error);

    return {
      success: false,
      provider: "flutterwave",
    };
  }
}
