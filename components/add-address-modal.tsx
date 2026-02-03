"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  address?: any; // present = edit mode
};

export default function AddAddressModal({ open, onClose, address }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    postalCode: "",
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setForm({
        fullName: address.fullName,
        street: address.street,
        city: address.city,
        state: address.state ?? "",
        country: address.country,
        phone: address.phone ?? "",
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const url = address ? `/api/addresses/${address.id}` : "/api/addresses";

    const method = address ? "PATCH" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error(`Failed to ${address ? "update" : "add"} address ❌`, {
        duration: 5000, // 5 seconds
      });
      return;
    }

    setForm({
      fullName: "",
      street: "",
      city: "",
      state: "",
      country: "",
      phone: "",
      postalCode: "",
      isDefault: false,
    });
    toast.success(`Address ${address ? "update" : "add"} successfully`, {
      duration: 5000, // 5 seconds
    });
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {address ? "Edit Address" : "Add Address"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Street Address"
              value={form.street}
              onChange={(e) => handleChange("street", e.target.value)}
            />
            <Input
              placeholder="City (optional)"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="State (optional)"
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
            <Input
              placeholder="Country"
              value={form.country}
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <Input
              placeholder="postalCode"
              value={form.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.isDefault}
              onCheckedChange={(v) => handleChange("isDefault", v)}
            />
            <span className="text-sm">Set as default address</span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading
                ? "Saving..."
                : address
                  ? "Update Address"
                  : "Save Address"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
