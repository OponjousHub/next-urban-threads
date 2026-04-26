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
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
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
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
        }),
      },
    );

    const data = await res.json();

    return {
      success: data.status === "success",
      provider: "flutterwave",
      reference: data.data?.id,
    };
  } catch {
    return { success: false, provider: "flutterwave" };
  }
}
