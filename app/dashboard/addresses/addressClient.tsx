"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddAddressModal from "../../../components/add-address-modal";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Address = {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  phone?: string | null;
  isDefault: boolean;
};

export default function AddressClient({ addresses }: { addresses: Address[] }) {
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Addresses</h1>

        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Add Address
        </button>
      </div>

      {/* Empty state */}
      {addresses.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            You haven’t added any addresses yet.
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            Add your first address
          </Button>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} className="relative">
            <CardContent className="p-5 space-y-3">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-base">{address.street}</p>

                  <p className="text-sm text-muted-foreground">
                    {address.city}
                    {address.state && `, ${address.state}`}
                    {`, ${address.country}`}
                  </p>
                </div>

                {address.isDefault && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Default
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedAddress(address);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    const ok = confirm("Delete this address?");
                    if (!ok) return;
                    const toastId = toast.loading("Deleting...");

                    try {
                      const res = await fetch(`/api/addresses/${address.id}`, {
                        method: "DELETE",
                      });

                      if (!res.ok) throw new Error("Failed");

                      toast.success("Address deleted successfully", {
                        id: toastId,
                        duration: 5000, // 5 seconds
                      });

                      router.refresh();
                    } catch (err) {
                      toast.error("Failed to delete address", {
                        id: toastId,
                        duration: 5000, // 5 seconds
                      });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddAddressModal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedAddress(null);
        }}
        address={selectedAddress}
      />
    </div>
  );
}
