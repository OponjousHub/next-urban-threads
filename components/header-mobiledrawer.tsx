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
  isMultiVendor: boolean;
};

export function MobileDrawer({
  menuOpen,
  setMenuOpen,
  categories,
  user,
  isMultiVendor,
}: MobileDrawerProps) {
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* DRAWER */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed top-0 left-0 h-[100dvh] w-[320px] max-w-[88vw] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Menu</h2>

            <button
              onClick={closeMenu}
              aria-label="Close menu"
              className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition"
            >
              <span className="text-2xl font-light">×</span>
            </button>
          </div>

          {/* USER / AUTH SECTION */}
          <div className="px-6 py-5 border-b border-gray-200">
            {user ? (
              <p className="text-base text-gray-700">
                Hi,{" "}
                <span className="font-semibold text-gray-900">{user.name}</span>
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="w-full min-h-[48px] flex items-center justify-center rounded-lg border border-gray-300 text-base font-medium text-gray-800 hover:bg-gray-50 transition"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="w-full min-h-[48px] flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-white text-base font-medium hover:opacity-90 transition"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>

          {/* NAVIGATION LINKS */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* HOME */}
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center min-h-[52px] text-[17px] text-gray-900 font-medium hover:text-[var(--color-primary)] transition"
            >
              Home
            </Link>

            {/* MULTI VENDOR */}
            {isMultiVendor && (
              <Link
                href="/stores"
                onClick={closeMenu}
                className="flex items-center min-h-[52px] text-[17px] text-gray-900 font-medium hover:text-[var(--color-primary)] transition"
              >
                Stores
              </Link>
            )}

            {/* SHOP HEADING */}
            <div className="pt-5 pb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Shop
              </span>
            </div>

            {/* ALL PRODUCTS */}
            <Link
              href="/products"
              onClick={closeMenu}
              className="flex items-center min-h-[52px] text-[17px] font-semibold text-gray-900 hover:text-[var(--color-primary)] transition"
            >
              All
            </Link>

            {/* CATEGORIES */}
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                onClick={closeMenu}
                className="flex items-center min-h-[52px] text-[17px] text-gray-800 hover:text-[var(--color-primary)] transition"
              >
                {cat.name}
              </Link>
            ))}

            {/* BECOME SELLER */}
            {isMultiVendor && (
              <Link
                href="/seller/register"
                onClick={closeMenu}
                className="flex items-center min-h-[52px] mt-3 text-[17px] font-semibold text-[var(--color-primary)]"
              >
                Become Seller
              </Link>
            )}
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Link
              href="/contact"
              onClick={closeMenu}
              className="flex items-center min-h-[44px] text-[15px] text-gray-600 hover:text-black transition"
            >
              Contact
            </Link>

            <Link
              href="/returns"
              onClick={closeMenu}
              className="flex items-center min-h-[44px] text-[15px] text-gray-600 hover:text-black transition"
            >
              Returns
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
