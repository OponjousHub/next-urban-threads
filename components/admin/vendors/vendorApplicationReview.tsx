"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/lib/status-badge";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { appToast } from "@/utils/appToast";
import { useRouter } from "next/navigation";

type VendorApplicationWithUser = Prisma.VendorApplicationGetPayload<{
  include: {
    user: true;
  };
}>;

type Props = {
  application: VendorApplicationWithUser;

  onActionComplete?: () => void;
};

export default function VendorApprovalReview({
  application,
  onActionComplete,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const router = useRouter();

  async function approveVendor() {
    try {
      setApproving(true);

      const res = await fetch(
        `/api/admin/vendors/application/${application.id}/approve`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        throw new Error();
      }

      appToast.success("Success", "Vendor approved successfully");

      onActionComplete?.();
      router.refresh();
    } catch {
      appToast.error("Failed", "Failed to approve application");
    } finally {
      setApproving(false);
    }
  }

  async function rejectVendor() {
    try {
      setRejecting(true);

      const res = await fetch(
        `/api/admin/vendors/application/${application.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejectionReason,
          }),
        },
      );

      if (!res.ok) {
        throw new Error();
      }
      appToast.success("Success", "Application rejected");

      onActionComplete?.();
      router.refresh();
    } catch {
      appToast.error("Failed", "Failed to reject application");
    } finally {
      setRejecting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="mb-8">
          <Link
            href="/admin/vendors"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Applications
          </Link>

          <h1 className="mt-4 text-3xl font-bold">Vendor Application</h1>

          <p className="text-muted-foreground">
            Review and approve vendor access.
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Application Status</h3>

            <StatusBadge status={application.status} />
          </div>
        </div>

        <div className="rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold">Business Information</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Business Name" value={application.businessName} />

            <Info
              label="Business Email"
              value={application.businessEmail || "-"}
            />

            <Info
              label="Business Phone"
              value={application.businessPhone || "-"}
            />

            <Info
              label="Submitted"
              value={new Date(application.createdAt).toLocaleDateString()}
            />
          </div>
        </div>

        <div className="rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold">Applicant Information</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <Info
              label="Name"
              value={application.user.name ?? "Not provided"}
            />

            <Info label="Email" value={application.user.email} />
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="font-semibold mb-3">Business Description</h3>

          <p className="whitespace-pre-wrap text-sm">
            {application.description || "No description provided"}
          </p>
        </div>

        <Separator />

        <div className="rounded-xl border p-5">
          <h3 className="font-semibold mb-3">Rejection Reason</h3>

          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Optional reason if rejecting..."
          />
        </div>

        {application.status === "PENDING" && (
          <div className="flex gap-3 text-white">
            <button
              onClick={rejectVendor}
              disabled={rejecting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rejecting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}

              {rejecting ? "Rejecting..." : "Reject Vendor"}
            </button>
            <button
              onClick={approveVendor}
              disabled={approving}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approving && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}

              {approving ? "Approving..." : "Approve Vendor"}
            </button>
          </div>
        )}

        {application.status === "APPROVED" && (
          <div className="rounded-lg border p-4  text-sky-600">
            This application has already been approved.
          </div>
        )}

        {application.status === "REJECTED" && (
          <div className="rounded-lg border p-4 text-orange-700">
            This application has already been rejected.
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="font-medium">{value}</p>
    </div>
  );
}
