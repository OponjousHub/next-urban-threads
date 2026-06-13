"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ totalPages }: { totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center mt-6 space-x-4">
      <button
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Prev
      </button>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Page</span>
        <span className="px-3 py-1 bg-[var(--color-primary)] text-white font-medium rounded-full shadow-sm">
          {currentPage}
        </span>
        <span className="text-sm text-gray-500">of {totalPages}</span>
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Next
      </button>
    </div>
  );
}
