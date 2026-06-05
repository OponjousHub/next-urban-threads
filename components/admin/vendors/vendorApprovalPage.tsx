"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/lib/status-badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import RefundReviewModal from "@/components/refunds/refundReviewModal";

type Refund = {
  id: string;
  orderId: string;
  status: string;
  requestedAmount: number;
  createdAt: string;
  reason: string;
};

type VendorApplication = {
  id: string;
  user: { id: string; name: string; email: string };
  businessName: String;
  businessEmail?: String;
  businessPhone?: String;
  description?: String;
  status: string;
  createdAt: string;
};

export default function VendorAprovalPage() {
  const [vendors, setVendors] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    try {
      const res = await fetch("/api/admin/vendors/application");
      const data = await res.json();
      setVendors(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="p-6">Loading vendors applications...</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendor applications</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Applicant</th>
              <th className="p-3 text-left">Business name</th>
              <th className="p-3 text-left">Business email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {vendors.map((r) => {
              return (
                <tr
                  key={r.id}
                  onClick={() => setSelectedVendor(r.id)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-3">{r.user.name}</td>
                  <td className="p-3">{r.businessName}</td>
                  <td className="p-3">{r.businessEmail}</td>
                  <td className="p-3">{r.businessPhone}</td>
                  <td className="p-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">view</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Dialog
          open={!!selectedVendor}
          onOpenChange={() => setSelectedVendor(null)}
        >
          <DialogContent className="max-w-3xl">
            {selectedVendor && (
              <RefundReviewModal
                refundId={selectedVendor}
                onClose={() => setSelectedVendor(null)}
                onActionComplete={fetchVendors}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
