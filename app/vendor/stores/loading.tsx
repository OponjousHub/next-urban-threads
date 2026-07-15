import { Search } from "lucide-react";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 animate-pulse">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mx-auto h-4 w-28 rounded-full bg-gray-200" />

        <div className="mx-auto mt-5 h-10 w-80 rounded-lg bg-gray-200" />

        <div className="mx-auto mt-5 h-4 w-[500px] max-w-full rounded-full bg-gray-200" />
        <div className="mx-auto mt-3 h-4 w-[360px] max-w-full rounded-full bg-gray-200" />
      </div>

      {/* Statistics */}
      <section className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-gray-200 bg-white p-8"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-10 w-20 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>

              <div className="h-14 w-14 rounded-2xl bg-gray-200" />
            </div>
          </div>
        ))}
      </section>

      {/* Search + Sort */}
      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-xl">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
          />

          <div className="h-14 rounded-2xl border border-gray-200 bg-gray-100" />
        </div>

        <div className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-100 md:w-64" />
      </div>

      {/* Result summary */}
      <div className="mt-10 mb-6 h-4 w-56 rounded bg-gray-200" />

      {/* Vendor Cards */}
      <section className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-gray-200 bg-white"
          >
            {/* Banner */}
            <div className="h-36 bg-gray-200" />

            <div className="relative px-6 pb-6">
              {/* Logo */}
              <div className="-mt-10 flex justify-center">
                <div className="h-20 w-20 rounded-full border-4 border-white bg-gray-200" />
              </div>

              {/* Store Name */}
              <div className="mx-auto mt-5 h-6 w-36 rounded bg-gray-200" />

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-100 p-4">
                  <div className="mx-auto h-5 w-5 rounded bg-gray-200" />
                  <div className="mx-auto mt-3 h-6 w-12 rounded bg-gray-200" />
                  <div className="mx-auto mt-2 h-3 w-16 rounded bg-gray-200" />
                </div>

                <div className="rounded-xl bg-gray-100 p-4">
                  <div className="mx-auto h-5 w-5 rounded bg-gray-200" />
                  <div className="mx-auto mt-3 h-6 w-12 rounded bg-gray-200" />
                  <div className="mx-auto mt-2 h-3 w-16 rounded bg-gray-200" />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 space-y-3">
                <div className="h-11 rounded-xl bg-gray-200" />
                <div className="h-11 rounded-xl bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
