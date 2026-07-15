"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  defaultValue: string;
};

export default function VendorSearch({ defaultValue }: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [search, setSearch] = useState(defaultValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      // Reset pagination when searching
      params.delete("page");

      router.replace(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-xl">
      <Search
        size={20}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search stores..."
        className="
          w-full
          rounded-2xl
          border
          border-gray-200
          bg-white
          py-4
          pl-14
          pr-5
          text-sm
          outline-none
          transition-all
          duration-300
          focus:border-[var(--color-primary)]
          focus:ring-4
          focus:ring-[var(--color-primary)]/10
        "
      />
    </div>
  );
}
