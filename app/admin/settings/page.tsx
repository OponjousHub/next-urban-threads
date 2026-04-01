"use client";

import { useState } from "react";
import { ProfileSection } from "@/components/admin/settings/profile-section";
import ChangePasswordAdmin from "@/components/admin/settings/change-password-setting";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [open, setOpen] = useState(false);

  const tabs = [
    { id: "general", label: "General" },
    { id: "profile", label: "Profile" },
    { id: "password", label: "Change password" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <div className="flex gap-8 max-w-6xl mx-auto p-6">
      {/* Sidebar */}
      <aside className="w-56 shrink-0">
        <div className="bg-white border rounded-2xl p-3 shadow-sm">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold capitalize">{activeTab}</h1>
          <p className="text-sm text-gray-500">
            Manage your {activeTab} settings
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "password" && <ChangePasswordAdmin />}
        {activeTab === "billing" && <BillingPlaceholder />}
      </main>
    </div>
  );
}

/* ---------------- General Settings ---------------- */

function GeneralSettings() {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h2 className="text-sm font-semibold mb-4">Store Information</h2>

      <div className="space-y-4">
        <Input label="Store Name" />
        <Input label="Support Email" />
        <Input label="Currency" />
      </div>
    </div>
  );
}

/* ---------------- Billing Placeholder ---------------- */

function BillingPlaceholder() {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h2 className="text-sm font-semibold mb-2">Billing</h2>
      <p className="text-sm text-gray-500">
        Connect Stripe or manage your subscription here.
      </p>
    </div>
  );
}

/* ---------------- Reusable Input ---------------- */

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
      />
    </div>
  );
}
