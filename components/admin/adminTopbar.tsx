"use client";

import { Bell } from "lucide-react";

export default function AdminTopbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <button className="text-gray-500 hover:text-black transition">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
            A
          </div>
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
}
