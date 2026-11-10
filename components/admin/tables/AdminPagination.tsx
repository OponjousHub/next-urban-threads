"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type AdminPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
}: AdminPaginationProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).slice(Math.max(0, currentPage - 3), currentPage + 2);

  const buttonBase =
    "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3 border-t bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{start}</span>–
        <span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className={`${buttonBase} bg-white hover:bg-gray-100`}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${buttonBase} ${
              page === currentPage
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={`${buttonBase} bg-white hover:bg-gray-100`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
