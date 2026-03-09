"use client";

import { useEffect, useState } from "react";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

interface Props {
  title: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  change?: number; // positive or negative
  icon?: React.ReactNode;
}

export default function KpiCard({
  title,
  value,
  prefix,
  suffix,
  decimals = 0,
  change,
  icon,
}: Props) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;

      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = progress * value;
      setDisplayValue(currentValue);

      if (progress < 1) requestAnimationFrame(step);
      else setDisplayValue(value);
    };

    requestAnimationFrame(step);
  }, [value]);

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-20" />

      <div className="relative z-10 flex justify-between items-center">
        <div>
          {/* Title + Trend */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{title}</p>

            {change !== undefined && (
              <div
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full cursor-default
                  ${isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
                `}
                title="Compared to last month" // Tooltip on hover
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

          {/* Animated Value */}
          <h3 className="text-3xl font-bold tracking-tight mt-2">
            {prefix}
            {(displayValue ?? 0).toFixed(decimals)}
            {suffix}
          </h3>
        </div>

        {/* Optional icon */}
        {icon && <div className="text-indigo-500 text-3xl">{icon}</div>}
      </div>
    </div>
  );
}
