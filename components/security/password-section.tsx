"use client";

import { useState } from "react";
import ChangePasswordModal from "../change-password-modal";
import formatDate from "@/utils/format-date";

interface PasswordSectionProps {
  passwordUpdated?: Date | null;
}

export default function PasswordSection({
  passwordUpdated,
}: PasswordSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Password</h3>
          <p className="text-sm text-gray-500">{`Last updated: ${
            passwordUpdated
              ? formatDate(passwordUpdated?.toISOString())
              : "Never"
          }`}</p>
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
