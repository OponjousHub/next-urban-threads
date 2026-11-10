"use client";

import { useState } from "react";
import Link from "next/link";
import AdminPagination from "@/components/admin/tables/AdminPagination";

type CouponRow = {
  id: string;
  code: string;
  vendorName: string | null;
  type: string;
  value: number;
  usedCount: number;
  usageLimit: number | null;
  active: boolean;
  expiresAt: string | null;
};

type Props = {
  coupons: CouponRow[];
  isMultiVendor: boolean;
};

const PAGE_SIZE = 10;

export default function CouponsTable({ coupons, isMultiVendor }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(coupons.length / PAGE_SIZE);
  const visibleCoupons = coupons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (coupons.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-sm text-gray-500">
        No coupons found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              {isMultiVendor && (
                <th className="px-4 py-3 font-medium">Vendor</th>
              )}
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {visibleCoupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{coupon.code}</td>

                {isMultiVendor && (
                  <td className="px-4 py-3">{coupon.vendorName || "Store"}</td>
                )}

                <td className="px-4 py-3">
                  {coupon.type === "PERCENTAGE"
                    ? `${coupon.value}%`
                    : coupon.value.toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  {coupon.usedCount}
                  {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ""}
                </td>

                <td className="px-4 py-3">
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString()
                    : "No expiry"}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      coupon.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/coupons/${coupon.id}`}
                    className="font-medium text-[var(--color-primary)] hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={coupons.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
