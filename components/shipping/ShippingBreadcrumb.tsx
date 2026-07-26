"use client";

import Link from "next/link";
import { ChevronRight, Truck } from "lucide-react";

type Props = {
  current: string;
};

export default function ShippingBreadcrumb({ current }: Props) {
  return (
    <div className="mb-6 flex items-center gap-2 text-sm">
      <Link
        href="/admin/shipping"
        className="flex items-center gap-2 text-gray-500 hover:text-black transition"
      >
        <Truck className="h-4 w-4" />
        Shipping
      </Link>

      <ChevronRight className="h-4 w-4 text-gray-400" />

      <span className="font-medium text-black">{current}</span>
    </div>
  );
}
