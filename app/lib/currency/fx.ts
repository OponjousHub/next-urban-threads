// app/lib/currency/fx.ts

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
  rates: Record<string, number>;
  source?: string;
  timestamp?: string;
  data_updated_at?: string;
  effective_at?: Record<string, string>;
  stale?: Record<string, boolean>;
};

const API_BASE_URL =
  process.env.FX_API_BASE_URL ?? "https://api.exchangerate.dev/v1";

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_RATE_AGE_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

const rateCache = new Map<string, ExchangeRate>();

export class ExchangeRateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExchangeRateError";
  }
}

/**
 * Retrieves the latest exchange rate.
 *
 * Rates are cached in memory for five minutes.
 * Cached values are only an optimization; Vercel instances
 * may have separate caches.
 */
export async function getExchangeRate(
  baseCurrency: string,
  quoteCurrency: string,
): Promise<ExchangeRate> {
  const base = baseCurrency.toUpperCase();
  const quote = quoteCurrency.toUpperCase();

  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote)) {
    throw new ExchangeRateError("Invalid currency code.");
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

  const cacheKey = `${base}:${quote}`;
  const cached = rateCache.get(cacheKey);

  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    return cached;
  }

  const url = new URL(`${API_BASE_URL}/latest/${base}`);

  url.searchParams.set("symbols", quote);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(process.env.EXCHANGERATE_API_KEY && {
          Authorization: `Bearer ${process.env.EXCHANGERATE_API_KEY}`,
        }),
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ExchangeRateError(
        `Exchange-rate provider returned HTTP ${response.status}.`,
      );
    }

    const data = (await response.json()) as ExchangeRateApiResponse;

    if (data.result !== "success") {
      throw new ExchangeRateError(
        "Exchange-rate provider returned an unsuccessful response.",
      );
    }

    if (data.base !== base) {
      throw new ExchangeRateError(
        "Exchange-rate provider returned an unexpected base currency.",
      );
    }

    const rate = data.rates?.[quote];

    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
      throw new ExchangeRateError(
        `No valid exchange rate available for ${base}/${quote}.`,
      );
    }

    if (data.stale?.[quote] === true) {
      throw new ExchangeRateError(
        `The ${base}/${quote} exchange rate is marked stale.`,
      );
    }

    const updatedAt = new Date(
      data.effective_at?.[quote] ?? data.data_updated_at ?? "",
    );

    if (Number.isNaN(updatedAt.getTime())) {
      throw new ExchangeRateError(
        "Exchange-rate provider returned an invalid timestamp.",
      );
    }

    const age = Date.now() - updatedAt.getTime();

    if (age < -60_000 || age > MAX_RATE_AGE_MS) {
      throw new ExchangeRateError(
        "The exchange rate is outside the permitted freshness window.",
      );
    }

    const result: ExchangeRate = {
      baseCurrency: base,
      quoteCurrency: quote,
      rate,
      source: data.source ?? "EXCHANGERATE_DEV",
      updatedAt,
      fetchedAt: new Date(),
    };

    rateCache.set(cacheKey, result);

    return result;
  } catch (error) {
    if (error instanceof ExchangeRateError) {
      throw error;
    }

    console.error("[FX_SERVICE_ERROR]", {
      baseCurrency: base,
      quoteCurrency: quote,
      error:
        error instanceof Error ? error.message : "Unknown exchange-rate error",
    });

    throw new ExchangeRateError(
      "Unable to retrieve a reliable exchange rate. Please try again.",
    );
  }
}

/**
 * Converts an amount using a supplied exchange rate.
 * Merchant margin is expressed as a percentage.
 */
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
