type RefundInput = {
  amount: number;
  reference: string;
};

export type RefundPaymentResult = {
  success: boolean;
  provider: string;
  reference?: string;
};

export async function refundPayment({
  amount,
  reference,
}: RefundInput): Promise<RefundPaymentResult> {
  // Detect provider based on the payment reference.
  if (reference.startsWith("ps_")) {
    return refundPaystack(amount, reference);
  }

  return refundFlutterwave(amount, reference);
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
  reference: string,
): Promise<RefundPaymentResult> {
  try {
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/${reference}/refund`,
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

    const data = await res.json();

    console.log("FLUTTERWAVE REFUND RESPONSE:", data);

    /*
     * Flutterwave can report that the transaction
     * has already been fully refunded.
     */
    const responseMessage =
      typeof data?.data === "string"
        ? data.data
        : typeof data?.message === "string"
          ? data.message
          : "";

    const isAlreadyRefunded = responseMessage
      .toLowerCase()
      .includes("already fully refunded");

    /*
     * Already refunded is still considered successful
     * from the perspective of our refund workflow.
     */
    if (isAlreadyRefunded) {
      return {
        success: true,
        provider: "flutterwave",
        reference: "already_refunded",
      };
    }

    /*
     * Normal successful Flutterwave refund.
     *
     * Flutterwave may return the refund ID as a number,
     * e.g. 107029.
     *
     * ALWAYS convert it to a string here because
     * RefundTransaction.transactionRef is a String.
     */
    if (res.ok && data?.status === "success") {
      const refundReference = data?.data?.id;

      return {
        success: true,
        provider: "flutterwave",
        reference:
          refundReference != null ? String(refundReference) : undefined,
      };
    }

    /*
     * Gateway responded but refund was not successful.
     */
    return {
      success: false,
      provider: "flutterwave",
    };
  } catch (error) {
    console.error("FLW REFUND ERROR:", error);

    return {
      success: false,
      provider: "flutterwave",
    };
  }
}
