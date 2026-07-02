import { PaymentProvider } from "@prisma/client";

import { FlutterwaveProvider } from "./flutterwave";
import { PaystackProvider } from "./paystack";

export function getPaymentProvider(provider: PaymentProvider) {
  switch (provider) {
    case PaymentProvider.PAYSTACK:
      return new PaystackProvider();

    default:
      return new FlutterwaveProvider();
  }
}
