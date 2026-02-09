import toast from "react-hot-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminToast } from "@/components/ui/adminToast";
import { useTenant } from "@/store/tenant-provider-context";

type Props = {
  open: boolean;
  onClose: () => void;
  address?: any; // present = edit mode
};

export default function ChangEmailModal({ open, onClose, address }: Props) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { tenant } = useTenant();

  const handleChangeEmail = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile/change-email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed");
      }

      toast.custom(
        <AdminToast
          title="Check your Email"
          description={`We just sent a token to ${newEmail}`}
        />,
        {
          duration: 6000, // ⏱️ 6 seconds
        },
      );
      onClose();

      setNewEmail("");
      setPassword("");
    } catch (err: any) {
      toast.custom(
        <AdminToast
          type="error"
          title="Failed!"
          description={
            err.message || "Could not change email! Please try again."
          }
        />,
        {
          duration: 6000, // ⏱️ 8 seconds
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        {/* Title */}
        {/* <h2 className="text-lg font-semibold text-gray-800">
          Change Email Address
        </h2> */}
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Change Email Address
          </DialogTitle>
        </DialogHeader>

        <p className="mt-1 text-sm text-gray-500">
          We will send a verification link to your new email.
        </p>

        {/* Form */}
        <div className="mt-4 space-y-4">
          {/* New Email */}
          <input
            type="email"
            placeholder="New Email Address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => onClose()}
            className="rounded-md border px-4 py-2 text-sm"
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
