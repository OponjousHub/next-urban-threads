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

import { appToast } from "@/utils/appToast";
import { Country, State } from "country-state-city";

type Address = {
  id: string;
  fullName: string | null;
  street: string;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  phone?: string | null;
  isDefault: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  address?: Address | null;
};

const EMPTY_FORM = {
  fullName: "",
  street: "",
  city: "",
  state: "",
  country: "",
  phone: "",
  postalCode: "",
  isDefault: false,
};

export default function AddAddressModal({ open, onClose, address }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const countries = Country.getAllCountries();

  const states = State.getStatesOfCountry(form.country);

  /**
   * Load the selected address when editing.
   *
   * When address becomes null, reset the form so that
   * "Add Address" always starts with a completely empty form.
   */
  useEffect(() => {
    if (address) {
      setForm({
        fullName: address.fullName ?? "",
        street: address.street ?? "",
        city: address.city ?? "",
        state: address.state ?? "",
        country: address.country ?? "",
        phone: address.phone ?? "",
        postalCode: address.postalCode ?? "",
        isDefault: address.isDefault ?? false,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [address]);

  /**
   * Also reset the form whenever the modal is closed.
   *
   * This protects against stale values regardless of whether
   * the modal was closed by Cancel, X, or after saving.
   */
  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
    }
  }, [open]);

  const handleChange = (
    key: keyof typeof EMPTY_FORM,
    value: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const isEdit = Boolean(address);

      const url = isEdit ? `/api/addresses/${address!.id}` : "/api/addresses";

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        appToast.error(
          "Error",
          `Failed to ${isEdit ? "update" : "add"} address ❌`,
        );
        return;
      }

      appToast.success(
        "Success",
        `Address ${isEdit ? "updated" : "added"} successfully`,
      );

      // Clear form before closing.
      setForm(EMPTY_FORM);

      // Close modal.
      onClose();

      // Refresh server-rendered address list.
      router.refresh();
    } catch (error) {
      console.error("ADDRESS SUBMIT ERROR:", error);

      appToast.error(
        "Error",
        `Failed to ${address ? "update" : "add"} address ❌`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
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
            <select
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
              className="w-full rounded-lg border p-3"
              disabled={!form.country}
            >
              <option value="">Select State (optional)</option>

              {states.map((state) => (
                <option key={state.isoCode} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>

            <select
              value={form.country}
              onChange={(e) => {
                const country = e.target.value;

                setForm((prev) => ({
                  ...prev,
                  country,
                  state: "",
                }));
              }}
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select Country</option>

              {countries.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <Input
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.isDefault}
              onCheckedChange={(value) =>
                handleChange("isDefault", value === true)
              }
              className="text-white"
            />

            <span className="text-sm">Set as default address</span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="text-white"
            >
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
