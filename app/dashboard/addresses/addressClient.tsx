"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUserDashboardStats } from "@/app/lib/dashboard";
import { AddAddressModal } from "../../../components/add-address-modal";

type DashboardAddress = Awaited<ReturnType<typeof getUserDashboardStats>>;

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
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Addresses</h1>

        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Add Address
        </button>
      </div>

      {/* Empty state */}
      {addresses.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center text-gray-500">
          You have no saved addresses yet.
        </div>
      )}

      {/* Address list */}
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="rounded-lg border p-4 space-y-1 bg-white"
          >
            <p className="font-medium">{address.street}</p>
            <p className="text-sm text-gray-600">
              {address.city}, {address.state ?? null}, {address.country}
            </p>

            {address.isDefault && (
              <span className="inline-block mt-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                Default
              </span>
            )}
          </div>
        ))}
      </div>

      {/* <AddAddressModal open={open} onClose={() => setOpen(false)} /> */}
    </div>
  );

  //   return (
  //     <div className="space-y-6">
  //       <div className="flex items-center justify-between">
  //         <h1 className="text-2xl font-semibold">My Addresses</h1>
  //         <Button>Add Address</Button>
  //       </div>
  //       <div className="grid gap-4">
  //         {addresses?.map((addr) => (
  //           <Card key={addr.id}>
  //             <CardContent className="p-4 flex justify-between items-start">
  //               <div>
  //                 <p className="font-medium">{addr.fullName}</p>
  //                 <p className="text-sm text-gray-600">{addr.street}</p>
  //                 <p className="text-sm text-gray-600">
  //                   {addr.city}, {addr.country}
  //                 </p>
  //                 {addr.isDefault && (
  //                   <span className="inline-block mt-2 text-xs text-green-600">
  //                     Default Address
  //                   </span>
  //                 )}
  //               </div>
  //               <div className="flex gap-2">
  //                 <Button size="sm" variant="outline">
  //                   Edit
  //                 </Button>
  //                 <Button size="sm" variant="destructive">
  //                   Delete
  //                 </Button>
  //               </div>
  //             </CardContent>
  //           </Card>
  //         ))}
  //       </div>
  //     </div>
  //   );
}
