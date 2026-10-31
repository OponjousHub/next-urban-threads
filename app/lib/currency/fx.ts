// app/lib/currency/fx.ts

import { prisma } from "@/utils/prisma";
import { currencyEnum } from "@prisma/client";

export type ExchangeRate = {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: string;
  updatedAt: Date;
  fetchedAt: Date;
};

type ExchangeRateApiResponse = {
  result: string;
  base: string;
  source?: string;
  rates: Record<string, number>;
  effective_at?: Record<string, string>;
  stale?: Record<string, boolean>;
};

const API_BASE_URL =
  process.env.FX_API_BASE_URL ?? "https://api.exchangerate.dev/v1";

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_RATE_AGE_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

const supportedCurrencies = new Set<string>(Object.values(currencyEnum));

export class ExchangeRateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExchangeRateError";
  }
}

export async function getExchangeRate(
  baseCurrency: string,
  quoteCurrency: string,
): Promise<ExchangeRate> {
  const base = baseCurrency.toUpperCase();
  const quote = quoteCurrency.toUpperCase();

  if (!supportedCurrencies.has(base) || !supportedCurrencies.has(quote)) {
    throw new ExchangeRateError("Unsupported currency.");
  }

  if (base === quote) {
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: 1,
      source: "IDENTITY",
      updatedAt: new Date(),
      fetchedAt: new Date(),
    };
  }

  const cacheWhere = {
    baseCurrency_quoteCurrency: {
      baseCurrency: base as currencyEnum,
      quoteCurrency: quote as currencyEnum,
    },
  };

  // 1. Check shared Neon cache
  const cached = await prisma.fXRate.findUnique({
    where: cacheWhere,
  });

  if (
    cached &&
    Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS &&
    !cached.stale
  ) {
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: Number(cached.rate),
      source: cached.source,
      updatedAt: cached.effectiveAt,
      fetchedAt: cached.fetchedAt,
    };
  }

  // 2. Request a fresh rate
  const apiKey = process.env.EXCHANGERATE_API_KEY;

  if (!apiKey) {
    throw new ExchangeRateError("Exchange-rate API key is not configured.");
  }

  const url = new URL(`${API_BASE_URL}/latest/${base}`);

  url.searchParams.set("symbols", quote);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ExchangeRateError(
        `Exchange-rate API returned HTTP ${response.status}.`,
      );
    }

    const data = (await response.json()) as ExchangeRateApiResponse;

    if (data.result !== "success" || data.base !== base) {
      throw new ExchangeRateError("Invalid exchange-rate API response.");
    }

    const rate = data.rates?.[quote];
    const effectiveAt = data.effective_at?.[quote];

    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
      throw new ExchangeRateError(
        `No valid ${base}/${quote} rate was returned.`,
      );
    }

    if (data.stale?.[quote] !== false) {
      throw new ExchangeRateError(
        `The ${base}/${quote} exchange rate is stale or unverified.`,
      );
    }

    if (!effectiveAt) {
      throw new ExchangeRateError("The exchange-rate timestamp is missing.");
    }

    const updatedAt = new Date(effectiveAt);

    if (Number.isNaN(updatedAt.getTime())) {
      throw new ExchangeRateError("Invalid exchange-rate timestamp.");
    }

    const age = Date.now() - updatedAt.getTime();

    if (age < -60_000 || age > MAX_RATE_AGE_MS) {
      throw new ExchangeRateError(
        "The exchange rate is outside the permitted freshness window.",
      );
    }

    // 3. Persist the rate in Neon
    const saved = await prisma.fXRate.upsert({
      where: cacheWhere,
      create: {
        baseCurrency: base as currencyEnum,
        quoteCurrency: quote as currencyEnum,
        rate,
        source: data.source ?? "EXCHANGERATE_DEV",
        effectiveAt: updatedAt,
        fetchedAt: new Date(),
        stale: false,
      },
      update: {
        rate,
        source: data.source ?? "EXCHANGERATE_DEV",
        effectiveAt: updatedAt,
        fetchedAt: new Date(),
        stale: false,
      },
    });

    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: Number(saved.rate),
      source: saved.source,
      updatedAt: saved.effectiveAt,
      fetchedAt: saved.fetchedAt,
    };
  } catch (error) {
    console.error("[FX_SERVICE_ERROR]", {
      baseCurrency: base,
      quoteCurrency: quote,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof ExchangeRateError) {
      throw error;
    }

    throw new ExchangeRateError(
      "Unable to retrieve a reliable exchange rate. Please try again.",
    );
  }
}

export function convertCurrency(
  amount: number,
  exchangeRate: number,
  marginPercent = 0,
): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ExchangeRateError("Invalid amount.");
  }

  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new ExchangeRateError("Invalid exchange rate.");
  }

  if (
    !Number.isFinite(marginPercent) ||
    marginPercent < 0 ||
    marginPercent > 100
  ) {
    throw new ExchangeRateError("Invalid conversion margin.");
  }

  const effectiveRate = exchangeRate * (1 + marginPercent / 100);

  return Math.round(amount * effectiveRate * 100) / 100;
}
