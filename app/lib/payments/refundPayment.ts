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

export async function refundPayment({
  amount,
  reference,
  provider,
  flutterwaveTransactionId,
}: RefundInput): Promise<RefundPaymentResult> {
  if (provider === "PAYSTACK") {
    return refundPaystack(amount, reference);
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

    return refundFlutterwave(amount, flutterwaveTransactionId);
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

    console.log("PAYSTACK REFUND RESPONSE:", data);

    if (!res.ok || data.status !== true) {
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
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
        }),
      },
    );

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

    const responseMessage =
      typeof data?.data === "string"
        ? data.data
        : typeof data?.message === "string"
          ? data.message
          : "";

    const isAlreadyRefunded = responseMessage
      .toLowerCase()
      .includes("already fully refunded");

    if (isAlreadyRefunded) {
      return {
        success: true,
        provider: "flutterwave",
        reference: "already_refunded",
      };
    }

    if (res.ok && data?.status === "success") {
      const refundReference = data?.data?.id;

      return {
        success: true,
        provider: "flutterwave",
        reference:
          refundReference != null ? String(refundReference) : undefined,
      };
    }

    console.error("FLUTTERWAVE REFUND FAILED:", {
      statusCode: res.status,
      response: data,
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
