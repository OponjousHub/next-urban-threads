"use client";

import { useState } from "react";
import Link from "next/link";
import { FiShoppingBag, FiMenu, FiX } from "react-icons/fi";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b-2 border-[#eee] sticky top-0 z-[1000]">
      <div className="flex items-center justify-between max-w-[1200px] mx-auto px-4 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-[#222] text-[2.4rem] font-bold no-underline"
        >
          Urban<span className="text-[var(--color-primary)]">Threads</span>
        </Link>

        {/* Navigation */}
        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute md:static top-[60px] left-0 w-full md:w-auto bg-white md:bg-transparent flex-col md:flex-row md:flex gap-6 text-[1.8rem] px-4 py-4 md:py-0 border-t md:border-none border-[#eee]`}
        >
          <Link className="hover:text-[var(--color-primary)]" href="/home">
            Home
          </Link>
          <Link className="hover:text-[var(--color-primary)]" href="/men">
            Men
          </Link>
          <Link className="hover:text-[var(--color-primary)]" href="/women">
            Women
          </Link>
          <Link
            className="hover:text-[var(--color-primary)]"
            href="/accessories"
          >
            Accessories
          </Link>
          <Link className="hover:text-[var(--color-primary)]" href="/sales">
            Sales
          </Link>
        </nav>

        {/* Search (desktop only) */}
        <div className="hidden md:flex items-center border border-[#bdb6b6] bg-[#f9f9f9] transition-all duration-[2000ms] rounded-[6px] overflow-hidden">
          <input
            type="text"
            placeholder="Search product..."
            className="focus:bg-white border-0 outline-0 py-2 px-3 text-[1.6rem] bg-transparent"
          />
          <button className="bg-[var(--color-primary)] px-4 py-2 border-0 text-amber-50 font-medium transition-colors duration-200 hover:bg-[#005ac1] cursor-pointer text-[1.6rem]">
            Search
          </button>
        </div>

        {/* Auth + Cart */}
        <div className=" flex items-center gap-2">
          <Link
            className="text-[1.6rem] hover:text-[var(--color-primary)]"
            href="/login"
          >
            Login
          </Link>
          <span className="text-[#666]">|</span>
          <Link
            className="hidden sm:block text-[1.6rem] hover:text-[var(--color-primary)]"
            href="/signup"
          >
            Signup
          </Link>
          <Link
            href="/cart"
            className="ml-4 text-[#333] transition-colors duration-200 hover:text-[var(--color-primary)]"
          >
            <FiShoppingBag size={22} />
          </Link>
        </div>
        {/* Menu Button (mobile only) */}
        <button
          className="block md:hidden text-[var(--color-primary)]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
