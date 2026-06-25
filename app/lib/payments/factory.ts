import { FlutterwaveProvider } from "./flutterwave";
import { PaystackProvider } from "./paystack";

export function getPaymentProvider(currency: string) {
  if (currency === "NGN") {
    return new PaystackProvider();
  }

  return new FlutterwaveProvider();
}
