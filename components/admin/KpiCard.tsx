"use client";

import { useEffect, useState } from "react";

interface Props {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: React.ReactNode;
}

export default function KpiCard({
  title,
  value,
  prefix,
  suffix,
  decimals = 0,
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

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value); // ensure exact final value
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-20" />

      <div className="relative z-10 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight mt-2">
            {prefix}
            {displayValue.toFixed(decimals)}
            {suffix}
          </h3>
        </div>

        {icon && <div className="text-indigo-500 text-3xl">{icon}</div>}
      </div>
    </div>
  );
}
