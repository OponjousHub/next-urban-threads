"use client";

import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type User = {
  name: string;
};

type MobileDrawerProps = {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
  user?: User | null;
};

export function MobileDrawer({
  menuOpen,
  setMenuOpen,
  categories,
  user,
}: MobileDrawerProps) {
  return (
    <>
      {/* 🔥 OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* 🔥 DRAWER */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 🔥 HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
          </div>

          {/* 🔥 USER / AUTH SECTION */}
          <div className="px-5 py-4 border-b">
            {user ? (
              <p className="text-sm text-gray-700">
                Hi, <span className="font-semibold">{user.name}</span>
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>

          {/* 🔥 NAV LINKS */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-base hover:text-[var(--color-primary)] transition"
            >
              Home
            </Link>

            <div className="mt-4 text-xs uppercase text-gray-400 tracking-wide">
              Shop
            </div>

            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-base font-semibold hover:text-[var(--color-primary)]"
            >
              All
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-base hover:text-[var(--color-primary)] transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* 🔥 FOOTER (optional but premium feel) */}
          <div className="px-5 py-4 border-t text-sm text-gray-500">
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="block py-1 hover:text-black"
            >
              Contact
            </Link>
            <Link
              href="/returns"
              onClick={() => setMenuOpen(false)}
              className="block py-1 hover:text-black"
            >
              Returns
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
