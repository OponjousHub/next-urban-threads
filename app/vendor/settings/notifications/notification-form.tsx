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
          form,
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="space-y-8">
          <NotificationGroup
            title="Orders"
            items={[
              {
                label: "New Order",
                description:
                  "Receive a notification whenever a customer places an order.",
                checked: form.newOrder,
                onChange: (v) => update("newOrder", v),
              },
              {
                label: "Order Cancelled",
                description: "Be notified when an order is cancelled.",
                checked: form.orderCancelled,
                onChange: (v) => update("orderCancelled", v),
              },
              {
                label: "Order Delivered",
                description:
                  "Receive updates when an order is marked as delivered.",
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
                description:
                  "Receive a notification when a product is running low on inventory.",
                checked: form.lowStock,
                onChange: (v) => update("lowStock", v),
              },
              {
                label: "Out of Stock",
                description:
                  "Get notified immediately when a product goes out of stock.",
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
                description:
                  "Be alerted whenever a customer submits a new product review.",
                checked: form.newReview,
                onChange: (v) => update("newReview", v),
              },
              {
                label: "New Store Follower",
                description:
                  "Receive a notification when a customer follows your store.",
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
                description:
                  "Be notified when a payout has been successfully processed.",
                checked: form.payoutCompleted,
                onChange: (v) => update("payoutCompleted", v),
              },
              {
                label: "Payout Failed",
                description:
                  "Receive an alert if a scheduled payout cannot be completed.",
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
                description:
                  "Get a weekly overview of your sales, orders, and store performance.",
                checked: form.weeklySummary,
                onChange: (v) => update("weeklySummary", v),
              },
              {
                label: "Monthly Performance Report",
                description:
                  "Receive a monthly report with key business insights and growth metrics.",
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
