"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/addresses")
      .then((res) => res.json())
      .then(setAddresses);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Addresses</h1>
        <Button>Add Address</Button>
      </div>
      <div className="grid gap-4">
        {addresses.map((addr) => (
          <Card key={addr.id}>
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <p className="font-medium">{addr.fullName}</p>
                <p className="text-sm text-gray-600">{addr.street}</p>
                <p className="text-sm text-gray-600">
                  {addr.city}, {addr.country}
                </p>
                {addr.isDefault && (
                  <span className="inline-block mt-2 text-xs text-green-600">
                    Default Address
                  </span>
                )}
              </div>
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
      </div>
    </div>
  );
}
