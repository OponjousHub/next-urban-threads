"use client";

import { useState } from "react";
import ChangePasswordModal from "../change-password-modal";

export default function PasswordSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Password</h3>
          <p className="text-sm text-gray-500">Last updated: Jan 12, 2026</p>
          <p className="text-green-600 text-sm mt-1">Strong Password ✓</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
        >
          Change Password
        </button>
      </div>

      {open && <ChangePasswordModal onClose={() => setOpen(false)} />}
    </div>
  );
}
