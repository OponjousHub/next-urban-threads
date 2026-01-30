"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { getUserDashboardStats } from "@/app/lib/dashboard";
import AddAddressModal from "../../../components/add-address-modal";

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

// export function AddressClient({ addresses }: { addresses: DashboardAddress }) {
export default function AddressClient({ addresses }: { addresses: Address[] }) {
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

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

      {/* Address list */}
      {/* <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="p-4 flex justify-between items-start">
          
              <p className="font-medium">{address.street}</p>
              <p className="text-sm text-gray-600">
                {address.city}, {address.state ?? null}, {address.country}
              </p>

              {address.isDefault && (
                <span className="inline-block mt-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  Default
                </span>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}
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

                <Button size="sm" variant="destructive">
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
