"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { appToast } from "@/utils/appToast";

type Props = {
  open: boolean;
  onClose: () => void;
  address?: any;
};

export default function ChangEmailModal({ open, onClose }: Props) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !password) {
      appToast.error(
        "Missing information",
        "Enter your new email and current password.",
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/profile/change-email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail: newEmail.trim(),
          password,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      const data = contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : null;

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "We couldn't process your request. Please check your details and try again.",
        );
      }

      if (!data) {
        throw new Error(
          "The server returned an unexpected response. Please try again.",
        );
      }

      appToast.success(
        "Check your email",
        `We sent a verification link to ${newEmail.trim()}.`,
      );

      onClose();
      setNewEmail("");
      setPassword("");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not change email. Please try again.";

      appToast.error("Email change failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Change Email Address
          </DialogTitle>
        </DialogHeader>

        <p className="mt-1 text-sm text-gray-500">
          We will send a verification link to your new email.
        </p>

        <div className="mt-4 space-y-4">
          <input
            type="email"
            placeholder="New Email Address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleChangeEmail}
            disabled={loading}
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Verification"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
