"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { useCart } from "@/store/cart-context";
import UserMenu from "./header-userMenu";
import { MobileDrawer } from "./header-mobiledrawer";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  role: "ADMIN" | "USER";
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

const HeaderClient = ({
  role,
  tenantName,
  categories,
}: {
  role: string | null;
  tenantName: string;
  categories: Category[];
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/users/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          setUser(null);
        } else {
          setUser(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    router.push(`/products?search=${encodeURIComponent(search)}`);
  };

  const handleReloadHeader = () => {
    setUser(null);
  };
  const cartCount = cartItems.reduce((sum, cur) => sum + cur.quantity, 0);

  // COMPUTING THE SHAPE OF THE STORE NAME
  const storeName = tenantName || "Store";

  // Split by spaces
  const nameParts = storeName.trim().split(" ");

  // Decide how to render
  const RenderStoreName = () => {
    if (nameParts.length === 1) {
      // Only one word → highlight it
      return (
        <span className="text-[var(--color-primary)]">{nameParts[0]}</span>
      );
    } else {
      // Multiple words → first word normal, second word highlighted
      return (
        <>
          {nameParts[0]}{" "}
          <span className="text-[var(--color-primary)]">
            {nameParts.slice(1).join(" ")}
          </span>
        </>
      );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-[1000] backdrop-blur bg-white/80 border-b border-gray-200 transition-all">
        <div
          className={`flex items-center justify-between max-w-[1200px] mx-auto px-4 transition-all duration-300 ${
            scrolled ? "py-2" : "py-4"
          }`}
        >
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              <RenderStoreName />
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8 text-base font-medium">
            <Link
              href="/"
              className="hover:text-[var(--color-primary)] transition"
            >
              Home
            </Link>

            <div className="group relative">
              <span className="cursor-pointer hover:text-[var(--color-primary)]">
                Shop
              </span>

              <div className="absolute top-full left-0 hidden group-hover:block bg-white border shadow-lg p-6 w-[420px] rounded-xl">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 transition"
                      // className="relative px-3 py-2 rounded-md transition hover:bg-gray-100"
                      // className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 transition"
                    >
                      <span className="transition group-hover:translate-x-1 group-hover:text-[var(--color-primary)]">
                        {cat.name}
                      </span>

                      {/* 👉 subtle arrow animation */}
                      <span className="opacity-0 translate-x-[-5px] group-hover:opacity-100 group-hover:translate-x-0 transition text-xs">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* SEARCH */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm hover:shadow-md transition focus-within:ring-2 focus-within:ring-[var(--color-primary)] duration-300 focus-within:w-[260px]"
          >
            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-sm w-[180px] bg-transparent placeholder:text-gray-400"
            />
            <button type="submit" className="text-sm text-gray-600">
              Search
            </button>
          </form>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-6">
            {/* CART */}
            <Link href="/cart" className="relative">
              <FiShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER */}
            {user ? (
              <UserMenu
                user={user}
                onRemoveAvater={handleReloadHeader}
                role={role}
              />
            ) : (
              <div className="hidden md:flex gap-4">
                <Link
                  className="text-base hover:text-[var(--color-primary)]"
                  href="/login"
                >
                  Login
                </Link>
                <Link
                  className="text-base hover:text-[var(--color-primary)]"
                  href="/signup"
                >
                  Signup
                </Link>
              </div>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden text-gray-700 ml-6"
              onClick={() => setMenuOpen(true)}
            >
              <FiMenu size={26} />
            </button>
          </div>
        </div>
      </header>
      <MobileDrawer
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        categories={categories}
      />
    </>
  );
};

export default HeaderClient;
