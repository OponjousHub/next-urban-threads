import { PaystackProvider } from "./paystack";
import { FlutterwaveProvider } from "./flutterwave";

export function getPaymentProvider(currency: string) {
  if (currency === "NGN") {
    return new FlutterwaveProvider();
  }

  return new FlutterwaveProvider();
}
