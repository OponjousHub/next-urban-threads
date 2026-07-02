import { currencyEnum, PaymentProvider } from "@prisma/client";

export function resolvePaymentConfig(country: string) {
  const normalized = country.trim().toLowerCase();

  switch (normalized) {
    case "nigeria":
      return {
        currency: currencyEnum.NGN,
        provider: PaymentProvider.PAYSTACK,
        countryCode: "NG",
      };

    case "kenya":
      return {
        currency: currencyEnum.KES,
        provider: PaymentProvider.FLUTTERWAVE,
        countryCode: "KE",
      };

    case "ghana":
      return {
        currency: currencyEnum.GHS,
        provider: PaymentProvider.FLUTTERWAVE,
        countryCode: "GH",
      };

    case "south africa":
      return {
        currency: currencyEnum.ZAR,
        provider: PaymentProvider.FLUTTERWAVE,
        countryCode: "ZA",
      };

    default:
      return {
        currency: currencyEnum.USD,
        provider: PaymentProvider.FLUTTERWAVE,
        countryCode: "US",
      };
  }
}
