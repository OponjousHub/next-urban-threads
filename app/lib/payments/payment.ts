import { currencyEnum, PaymentProvider } from "@prisma/client";

export function resolvePaymentConfig(country: string) {
  const code = country.toUpperCase();

  switch (code) {
    case "NG":
      return {
        currency: currencyEnum.NGN,
        provider: PaymentProvider.PAYSTACK,
      };
    default:
      return {
        currency: currencyEnum.USD,
        provider: PaymentProvider.FLUTTERWAVE,
      };
  }
}
