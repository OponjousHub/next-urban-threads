"use client";

import { FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

const MenuToggle = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <button
      className=" md:hidden border-0 cursor-pointer"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
    </button>
  );
};

export default MenuToggle;
