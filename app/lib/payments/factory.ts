import { PaymentProvider } from "@prisma/client";
import { FlutterwaveProvider } from "./flutterwave";
import { PaystackProvider } from "./paystack";
// import { StripeProvider } from "./stripe"; // if implemented

export function getPaymentProvider(provider: PaymentProvider) {
  switch (provider) {
    case PaymentProvider.PAYSTACK:
      return new PaystackProvider();

    case PaymentProvider.FLUTTERWAVE:
      return new FlutterwaveProvider();

    // case PaymentProvider.STRIPE:
    //   return new StripeProvider();

    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}
