"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { useCart } from "@/store/cart-context";
import UserMenu from "./header-userMenu";
import { MobileDrawer } from "./header-mobiledrawer";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import HeaderSearch from "./headerSearch";

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
  const [searchOpen, setSearchOpen] = useState(false);

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
    setSearchOpen(false);
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
          <div className="hidden md:block w-[240px]">
            <HeaderSearch />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-6">
            {/* SEARCH ICON */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden text-gray-700"
            >
              <FiSearch size={20} />
            </button>

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
      {searchOpen && (
        <div className="fixed inset-0 bg-black/40 z-[2000] flex items-start justify-center pt-20">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-4 shadow-lg">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 border rounded-full px-4 py-2"
            >
              <FiSearch className="text-gray-500" />

              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm"
              />

              <button type="submit" className="text-sm text-gray-600">
                Search
              </button>
            </form>

            <button
              onClick={() => setSearchOpen(false)}
              className="mt-4 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <MobileDrawer
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        categories={categories}
      />
    </>
  );
};

export default HeaderClient;
