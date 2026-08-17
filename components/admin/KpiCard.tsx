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
}: Props) {
  const [displayValue, setDisplayValue] = useState<number | null>(null);

  const isLoading = Number.isNaN(value);
  const isUnavailable = value === null;

  useEffect(() => {
    // Nothing to animate when the KPI is unavailable.
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
    <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-20" />

      <div className="relative z-10 flex justify-between items-center">
        <div>
          {/* Title + Trend */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{title}</p>

            {change !== undefined && change !== null && (
              <div
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full cursor-default
                  ${
                    isPositive
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }
                `}
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
          <h3 className="text-3xl font-bold tracking-tight mt-2">
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

          {/* Explanation for unavailable KPI */}
          {isUnavailable && (
            <p className="mt-1 text-xs text-gray-400">
              Not enough traffic data
            </p>
          )}
        </div>

        {/* Optional icon */}
        {icon && (
          <div className="text-[var(--color-primary-light)] text-3xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
