"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AdminPagination from "@/components/admin/tables/AdminPagination";

type PaginationProps = {
  totalPages: number;
  totalItems: number;
  pageSize?: number;
};

export default function Pagination({
  totalPages,
  totalItems,
  pageSize = 10,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <AdminPagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={goToPage}
    />
  );
}
