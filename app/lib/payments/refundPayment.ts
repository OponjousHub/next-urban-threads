type RefundInput = {
  amount: number;
  reference: string;
};

export async function refundPayment({
  amount,
  reference,
}: RefundInput): Promise<{
  success: boolean;
  provider: string;
  reference?: string;
}> {
  // 🔀 Detect provider (based on your system)
  if (reference.startsWith("ps_")) {
    return refundPaystack(amount, reference);
  }

  return refundFlutterwave(amount, reference);
}

async function refundPaystack(amount: number, reference: string) {
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

    return {
      success: data.status,
      provider: "paystack",
      reference: data.data?.reference,
    };
  } catch {
    return { success: false, provider: "paystack" };
  }
}

async function refundFlutterwave(amount: number, reference: string) {
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
    console.log("FLW REFUND FULL RESPONSE:", data);

    const isAlreadyRefunded =
      typeof data?.data === "string" &&
      data.data.toLowerCase().includes("already fully refunded");

    return {
      success: data.status === "success" || isAlreadyRefunded,
      provider: "flutterwave",
      reference: data?.data?.id ?? "already_refunded",
    };
  } catch (error) {
    console.error("FLW REFUND ERROR:", error);
    return { success: false, provider: "flutterwave" };
  }
}
