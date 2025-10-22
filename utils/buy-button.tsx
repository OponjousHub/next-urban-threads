"use client";
import "@/app/globals.css";

// import { FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

const BuyButton = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <button
      className=" border-0 cursor-pointer bg-[var(--color-primary)] my-7 text-white font-bold py-6 px-12 rounded-[0.8rem]"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      Add to Cart
    </button>
  );
};

export default BuyButton;
