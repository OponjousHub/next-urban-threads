"use client";

import {
  FiBell,
  FiSearch,
  FiMenu,
  FiUser,
  FiShoppingBag,
} from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Activity = {
  id: string;
  message: string;
};

type User = {
  name: string;
  image?: string | null;
};

interface Props {
  toggle: () => void;
  user?: User;
}

export default function AdminTopbar({ toggle, user }: Props) {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Activity[]>([]);
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState<{
    orders: any[];
    customers: any[];
  }>({
    orders: [],
    customers: [],
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    fetch("/api/admin/activities")
      .then((res) => res.json())
      .then(setNotifications);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query) {
      setResults({ orders: [], customers: [] });
      return;
    }

    setLoading(true);

    const delay = setTimeout(() => {
      fetch(`/api/admin/search?q=${query}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
          setActiveIndex(0);
        });
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  // Flatten results for keyboard nav
  const flatResults = [
    ...results.orders.map((o) => ({ ...o, type: "order" })),
    ...results.customers.map((c) => ({ ...c, type: "customer" })),
  ];

  // Highlight match
  const highlight = (text: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 rounded px-1">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };
  const count = 3;

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-50 h-16 bg-white border-b px-6 flex items-center justify-between "
    >
      {/* Menu */}
      <button
        onClick={toggle}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        <FiMenu size={20} />
      </button>

      {/* 🔍 SEARCH */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
          <FiSearch className="text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                setActiveIndex((prev) =>
                  Math.min(prev + 1, flatResults.length - 1),
                );
              }

              if (e.key === "ArrowUp") {
                setActiveIndex((prev) => Math.max(prev - 1, 0));
              }

              if (e.key === "Enter") {
                const selected = flatResults[activeIndex];

                if (selected) {
                  if (selected.type === "order") {
                    router.push(`/admin/orders/${selected.id}`);
                  } else {
                    router.push(`/admin/customers/${selected.id}`);
                  }
                } else {
                  router.push(`/admin/search?q=${query}`);
                }

                setSearchOpen(false);
              }
            }}
            placeholder="Search orders, customers..."
            className="bg-transparent outline-none text-sm w-64"
          />
        </div>

        {/* Dropdown */}
        {searchOpen && query && (
          <div className="absolute left-0 top-full mt-2 w-96 bg-white shadow-lg rounded-xl p-4 z-50 max-h-96 overflow-y-auto">
            {/* Loading */}
            {loading && <p className="text-sm text-gray-400">Searching...</p>}

            {/* Orders */}
            {results.orders.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <FiShoppingBag size={12} />
                  Orders ({results.orders.length})
                </p>

                {results.orders.map((o, i) => {
                  const index = i;
                  return (
                    <div
                      key={o.id}
                      className={`p-2 rounded cursor-pointer ${
                        activeIndex === index ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        router.push(`/admin/orders/${o.id}`);
                        setSearchOpen(false);
                      }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">#{highlight(o.id)}</span>
                        <span className="text-gray-500">${o.totalAmount}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {highlight(o.user?.name || "")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Customers */}
            {results.customers.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <FiUser size={12} />
                  Customers ({results.customers.length})
                </p>

                {results.customers.map((c, i) => {
                  const index = results.orders.length + i;

                  return (
                    <div
                      key={c.id}
                      className={`p-2 rounded cursor-pointer ${
                        activeIndex === index ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        router.push(`/admin/customers/${c.id}`);
                        setSearchOpen(false);
                      }}
                    >
                      <div className="text-sm font-medium">
                        {highlight(c.name)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {highlight(c.email)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty */}
            {!loading &&
              results.orders.length === 0 &&
              results.customers.length === 0 && (
                <p className="text-sm text-gray-500">
                  No results for "{query}"
                </p>
              )}

            {/* View all */}
            <div
              className="mt-3 text-xs text-blue-600 cursor-pointer"
              onClick={() => {
                router.push(`/admin/search?q=${query}`);
                setSearchOpen(false);
              }}
            >
              View all results →
            </div>
          </div>
        )}
      </div>

      {/* 🔔 RIGHT */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button className="relative" onClick={() => setOpen((p) => !p)}>
            <FiBell size={20} />

            {count > 0 && (
              <span className="absolute -top-2 -right-3 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white shadow rounded-xl p-3">
              {notifications.map((n) => (
                <div key={n.id} className="text-sm border-b py-2">
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2">
          {user?.image ? (
            <img
              src={user.image}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs">
              {user?.name?.[0] || "A"}
            </div>
          )}

          <span className="text-sm font-medium">{user?.name || "Admin"}</span>
        </div>
      </div>
    </header>
  );
}
