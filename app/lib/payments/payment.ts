import { Currency, PaymentProvider } from "@prisma/client";

export function resolvePaymentConfig(country: string) {
  const code = country.toUpperCase();

  switch (code) {
    case "NG":
      return {
        currency: Currency.NGN,
        provider: PaymentProvider.PAYSTACK,
      };
    default:
      return {
        currency: Currency.USD,
        provider: PaymentProvider.FLUTTERWAVE,
      };
  }
}
