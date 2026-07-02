"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

type Bank = {
  code: string;
  name: string;
};

type Props = {
  value: string;
  onSelect: (bank: Bank) => void;
};

export default function BankSelector({ value, onSelect }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [filtered, setFiltered] = useState<Bank[]>([]);

  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBanks();
  }, []);

  async function loadBanks() {
    try {
      setLoading(true);

      const res = await fetch("/api/banks");

      const data = await res.json();

      setBanks(data);
      setFiltered(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const q = search.toLowerCase();

    setFiltered(banks.filter((bank) => bank.name.toLowerCase().includes(q)));
  }, [search, banks]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-xl
          border
          bg-white
          px-4
          py-3
          text-left
          shadow-sm
        "
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Select Bank"}
        </span>

        <ChevronDown
          className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="
            absolute
            z-50
            mt-2
            w-full
            rounded-xl
            border
            bg-white
            shadow-xl
          "
        >
          <div className="border-b p-3">
            <div className="relative">
              <Search
                className="
                  absolute
                  left-3
                  top-3
                  h-4
                  w-4
                  text-gray-400
                "
              />

              <input
                autoFocus
                placeholder="Search bank..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full
                  rounded-lg
                  border
                  py-2
                  pl-10
                  pr-3
                  outline-none
                "
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading banks...
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No bank found.
              </div>
            )}

            {!loading &&
              filtered.map((bank) => (
                <button
                  key={`${bank.code}-${bank.name}`}
                  type="button"
                  onClick={() => {
                    onSelect(bank);

                    setSearch("");

                    setOpen(false);
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    px-4
                    py-3
                    text-left
                    hover:bg-gray-50
                  "
                >
                  <span>{bank.name}</span>

                  {value === bank.name && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
