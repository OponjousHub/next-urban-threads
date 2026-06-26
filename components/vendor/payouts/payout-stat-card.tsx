"use client";

import { useTenant } from "@/store/tenant-provider-context";

type Props = {
  title: string;
  value: number;
  color: "green" | "yellow" | "blue" | "purple" | "red" | "emerald";
};

const colors = {
  green: "bg-green-50 border-green-200",
  yellow: "bg-yellow-50 border-yellow-200",
  blue: "bg-blue-50 border-blue-200",
  purple: "bg-purple-50 border-purple-200",
  red: "bg-red-50 border-red-200",
  emerald: "bg-emerald-50 border-emerald-200",
};

export default function PayoutStatCard({ title, value, color }: Props) {
  const { tenant } = useTenant();
  return (
    <div className={`rounded-xl border p-6 shadow-sm ${colors[color]}`}>
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className="mt-2 text-3xl font-bold">
        {tenant?.currency}
        {value.toLocaleString()}
      </h2>
    </div>
  );
}
