"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

import { appToast } from "@/utils/appToast";

import NotificationGroup from "./notification-group";

type NotificationSettings = {
  id: string;
  vendorId: string;

  newOrder: boolean;
  orderCancelled: boolean;
  orderDelivered: boolean;

  lowStock: boolean;
  outOfStock: boolean;

  newReview: boolean;
  newFollower: boolean;

  payoutCompleted: boolean;
  payoutFailed: boolean;

  weeklySummary: boolean;
  monthlySummary: boolean;
};

type Props = {
  vendorId: string;
  settings: NotificationSettings;
};

export default function NotificationForm({ vendorId, settings }: Props) {
  const [form, setForm] = useState(settings);

  const [saving, setSaving] = useState(false);

  function update<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function save() {
    try {
      setSaving(true);

      const res = await fetch("/api/vendor/settings/notifications", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          vendorId,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      appToast.success("Notification settings updated.");
    } catch (err: any) {
      appToast.error(err.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Notification Preferences</h2>

            <p className="text-sm text-gray-500">
              Choose the notifications you want to receive.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <NotificationGroup
            title="Orders"
            items={[
              {
                label: "New Order",
                checked: form.newOrder,
                onChange: (v) => update("newOrder", v),
              },
              {
                label: "Order Cancelled",
                checked: form.orderCancelled,
                onChange: (v) => update("orderCancelled", v),
              },
              {
                label: "Order Delivered",
                checked: form.orderDelivered,
                onChange: (v) => update("orderDelivered", v),
              },
            ]}
          />

          <NotificationGroup
            title="Inventory"
            items={[
              {
                label: "Low Stock Alert",
                checked: form.lowStock,
                onChange: (v) => update("lowStock", v),
              },
              {
                label: "Out of Stock",
                checked: form.outOfStock,
                onChange: (v) => update("outOfStock", v),
              },
            ]}
          />

          <NotificationGroup
            title="Customers"
            items={[
              {
                label: "New Product Review",
                checked: form.newReview,
                onChange: (v) => update("newReview", v),
              },
              {
                label: "New Store Follower",
                checked: form.newFollower,
                onChange: (v) => update("newFollower", v),
              },
            ]}
          />

          <NotificationGroup
            title="Payments"
            items={[
              {
                label: "Payout Completed",
                checked: form.payoutCompleted,
                onChange: (v) => update("payoutCompleted", v),
              },
              {
                label: "Payout Failed",
                checked: form.payoutFailed,
                onChange: (v) => update("payoutFailed", v),
              },
            ]}
          />

          <NotificationGroup
            title="Reports"
            items={[
              {
                label: "Weekly Sales Summary",
                checked: form.weeklySummary,
                onChange: (v) => update("weeklySummary", v),
              },
              {
                label: "Monthly Performance Report",
                checked: form.monthlySummary,
                onChange: (v) => update("monthlySummary", v),
              },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-[var(--color-primary)] px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
