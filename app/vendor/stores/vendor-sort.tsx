"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  currentSort: string;
};

const SORT_OPTIONS = [
  {
    label: "Most Followed",
    value: "followers",
  },
  {
    label: "Most Products",
    value: "products",
  },
  {
    label: "Newest",
    value: "newest",
  },
];

export default function VendorSort({ currentSort }: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", value);

    // Reset pagination when sort changes
    params.delete("page");

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full md:w-64">
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="
          w-full
          rounded-2xl
          border
          border-gray-200
          bg-white
          px-5
          py-4
          text-sm
          outline-none
          transition-all
          duration-300
          focus:border-[var(--color-primary)]
          focus:ring-4
          focus:ring-[var(--color-primary)]/10
        "
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
