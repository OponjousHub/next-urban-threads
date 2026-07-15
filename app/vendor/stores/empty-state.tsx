import Link from "next/link";
import { Store } from "lucide-react";

export default function EmptyState() {
  return (
    <section className="mt-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-8 py-16 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
          <Store size={42} className="text-gray-400" />
        </div>

        <h2 className="mt-8 text-3xl font-bold text-gray-900">
          No Stores Found
        </h2>

        <p className="mt-4 text-gray-500">
          We couldn't find any stores matching your search.
          <br />
          Try another keyword or browse all available stores.
        </p>

        <Link
          href="/vendor/stores"
          className="
            mt-8
            inline-flex
            items-center
            justify-center
            rounded-2xl
            bg-[var(--color-primary)]
            px-8
            py-3
            font-semibold
            text-white
            transition
            hover:opacity-90
          "
        >
          Browse All Stores
        </Link>
      </div>
    </section>
  );
}
