import { PaymentProvider } from "@prisma/client";
import { FlutterwaveProvider } from "./flutterwave";
import { PaystackProvider } from "./paystack";

import { currencyEnum } from "@prisma/client";

export function getPaymentProvider(currency: currencyEnum) {
  if (currency === currencyEnum.NGN) {
    return new PaystackProvider();
  }

  return new FlutterwaveProvider();
}
