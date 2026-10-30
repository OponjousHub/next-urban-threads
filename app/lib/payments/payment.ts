import { currencyEnum, PaymentProvider } from "@prisma/client";

export function resolvePaymentConfig(country: string) {
  const normalized = country.trim().toUpperCase();

  switch (normalized) {
    case "NG":
    case "NGA":
    case "NIGERIA":
      return {
        currency: currencyEnum.NGN,
        provider: PaymentProvider.PAYSTACK,
        countryCode: "NG",
      };

    case "KE":
    case "KEN":
    case "KENYA":
      return {
        currency: currencyEnum.KES,
        provider: PaymentProvider.FLUTTERWAVE,
        countryCode: "KE",
      };

    case "GH":
    case "GHA":
    case "GHANA":
      return {
        currency: currencyEnum.GHS,
        provider: PaymentProvider.FLUTTERWAVE,
        countryCode: "GH",
      };

    case "ZA":
    case "ZAF":
    case "SOUTH AFRICA":
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
