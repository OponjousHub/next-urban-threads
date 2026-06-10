"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VendorDetailSkeleton } from "@/utils/adminSkeleton";
import { appToast } from "@/utils/appToast";
import { Textarea } from "@/components/ui/textarea";

import {
  FaArrowLeft,
  FaChevronRight,
  FaStore,
  FaUser,
  FaBox,
  FaShoppingBag,
} from "react-icons/fa";
import { StatusBadge } from "@/lib/status-badge";
import { Vendor, VendorApplication } from "@/types/vendor";

export default function VendorDetailPage({ vendorId }: { vendorId: string }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [application, setApplication] = useState<VendorApplication | null>(
    null,
  );

  useEffect(() => {
    fetchVendor();
  }, []);

  async function fetchVendor() {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/vendors/manage/${vendorId}`);

      const data = await response.json();
      console.log("DATAaaaaaa", data);
      setVendor(data.data);
      setApplication(data.application);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange() {
    try {
      setActionLoading(true);

      const endpoint = vendor?.status === "APPROVED" ? "suspend" : "reactivate";

      // Prevent suspension without suspensionReason
      if (vendor?.status === "APPROVED" && !suspensionReason.trim()) {
        appToast.warning("Required", "Please provide a suspension reason");

        return;
      }

      const response = await fetch(
        `/api/admin/vendors/manage/${vendorId}/${endpoint}`,
        {
          method: "POST",
          body: JSON.stringify({
            suspensionReason:
              vendor?.status === "APPROVED" ? suspensionReason : null,
          }),
        },
      );

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || "Action failed");
      }

      fetchVendor();

      appToast.success(
        "Success",
        endpoint === "suspend" ? "Vendor suspended" : "Vendor reactivated",
      );
    } catch (error: any) {
      appToast.error("Failed", error.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <VendorDetailSkeleton />;
  }

  if (!vendor) {
    return <div className="p-8">Vendor not found</div>;
  }

  const owner = vendor.users[0];
  console.log("applicationnnn", application);
  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      {/* Header */}

      <div>
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <FaArrowLeft size={12} />
          Back to Vendors
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{vendor.name}</h1>

            <p className="text-muted-foreground">Vendor Profile</p>
          </div>

          <StatusBadge status={vendor.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Info */}

        <Card icon={<FaStore />} title="Business Information">
          <Info label="Business Name" value={vendor.name} />

          <Info label="Slug" value={vendor.slug} />

          <Info label="Email" value={vendor.email || "-"} />

          <Info label="Phone" value={vendor.phone || "-"} />

          <Info
            label="Created"
            value={new Date(vendor.createdAt).toLocaleDateString()}
          />
        </Card>

        {/* Stats */}

        <Card icon={<FaShoppingBag />} title="Statistics">
          <Link
            href={`/admin/vendors/manage/${vendor.id}/products`}
            className="
    flex items-center justify-between
    rounded-xl border p-4
    hover:bg-gray-50
  "
          >
            <div>
              <p className="text-sm text-muted-foreground">Products</p>

              <p className="text-2xl font-bold">{vendor._count.products}</p>
            </div>

            <FaChevronRight />
          </Link>

          <Link
            href={`/admin/vendors/manage/${vendor.id}/orders`}
            className="
    flex items-center justify-between
    rounded-xl border p-4
    hover:bg-gray-50
  "
          >
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>

              <p className="text-2xl font-bold">{vendor._count.orders}</p>
            </div>

            <FaChevronRight />
          </Link>
        </Card>

        {/* Owner */}

        <Card icon={<FaUser />} title="Owner Information">
          <Info label="Name" value={owner?.name || "-"} />

          <Info label="Email" value={owner?.email || "-"} />

          <Info label="Role" value={owner?.role || "-"} />

          <Info
            label="Joined"
            value={
              owner?.createdAt
                ? new Date(owner.createdAt).toLocaleDateString()
                : "-"
            }
          />
        </Card>

        {/* Actions */}

        <Card icon={<FaBox />} title="Actions">
          {!vendor.suspensionReason && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="font-semibold text-red-700">Suspension Reason</h3>

              <Textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Reason for suspending..."
              />
            </div>
          )}

          {vendor.status === "APPROVED" ? (
            <button
              onClick={handleStatusChange}
              disabled={actionLoading}
              className={`inline-flex items-center justify-center gap-2 w-full rounded-xl
                bg-red-600 px-4 py-3
                font-medium text-white
                hover:bg-red-700`}
            >
              {actionLoading && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {actionLoading ? "Processing..." : "Suspend Vendor"}
            </button>
          ) : (
            <button
              onClick={handleStatusChange}
              disabled={actionLoading}
              className="
              inline-flex items-center justify-center gap-2
                w-full rounded-xl
                bg-green-600 px-4 py-3
                font-medium text-white
                hover:bg-green-700
              "
            >
              {actionLoading && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {actionLoading ? "Processing..." : "Reactivate Vendor"}
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="text-lg">{icon}</div>

        <h2 className="font-semibold">{title}</h2>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-3">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span className="font-medium">{value}</span>
    </div>
  );
}
