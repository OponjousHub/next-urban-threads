"use client";

import { useEffect, useState } from "react";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { formatCurrency } from "@/lib/formatCurrency";

interface Props {
  title: string;
  value: number | null;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  currency?: string;
  change?: number | null;
  icon?: React.ReactNode;

  /**
   * Optional message shown when value === null.
   * This allows different KPIs to have different explanations.
   */
  unavailableMessage?: string;
}

export default function KpiCard({
  title,
  value,
  prefix,
  suffix,
  currency,
  decimals = 0,
  change,
  icon,
  unavailableMessage,
}: Props) {
  const [displayValue, setDisplayValue] = useState<number | null>(null);

  /**
   * NaN means the KPI is still loading.
   */
  const isLoading = Number.isNaN(value);

  /**
   * null means the KPI is unavailable / cannot currently
   * be calculated.
   */
  const isUnavailable = value === null;

  useEffect(() => {
    if (value === null || !Number.isFinite(value)) {
      setDisplayValue(null);
      return;
    }

    let startTimestamp: number | null = null;

    const duration = 700;

    const step = (timestamp: number) => {
      if (!startTimestamp) {
        startTimestamp = timestamp;
      }

      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      const currentValue = progress * value;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  const isPositive = change !== undefined && change !== null && change >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/60 p-6 shadow-sm backdrop-blur-lg transition-all duration-300 hover:shadow-lg group">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-20" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          {/* Title + Trend */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{title}</p>

            {change !== undefined && change !== null && (
              <div
                className={`flex cursor-default items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  isPositive
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
                title="Compared to previous period"
              >
                {isPositive ? (
                  <FiArrowUp size={16} />
                ) : (
                  <FiArrowDown size={16} />
                )}
                {isPositive ? "+" : ""}
                {change}%
              </div>
            )}
          </div>

          {/* KPI Value */}
          <h3 className="mt-2 text-3xl font-bold tracking-tight">
            {isLoading ? (
              <span className="inline-block h-9 w-24 animate-pulse rounded-md bg-gray-100" />
            ) : isUnavailable ? (
              <span title="Not enough data for a reliable calculation">—</span>
            ) : displayValue === null ? (
              <span className="inline-block h-9 w-24 animate-pulse rounded-md bg-gray-100" />
            ) : currency ? (
              formatCurrency(displayValue, currency, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })
            ) : (
              `${prefix ?? ""}${displayValue.toFixed(decimals)}${suffix ?? ""}`
            )}
          </h3>

          {/* Optional explanation for unavailable KPI */}
          {isUnavailable && unavailableMessage && (
            <p className="mt-1 text-xs text-gray-400">{unavailableMessage}</p>
          )}
        </div>

        {/* Optional icon */}
        {icon && (
          <div className="text-3xl text-[var(--color-primary-light)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
