"use client";

import { useState } from "react";
import { ProfileSection } from "@/components/admin/settings/profile-section";
import ChangePasswordAdmin from "@/components/admin/settings/change-password-setting";
import GeneralSettings from "@/components/admin/settings/general-setting";
import ManageCategory from "@/components/admin/settings/category-setting";
import NewsletterAdminPage from "@/components/admin/settings/manage-subscription";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General" },
    { id: "profile", label: "Profile" },
    { id: "password", label: "Change password" },
    { id: "category", label: "Manage category" },
    { id: "subcription", label: "Manage subcription" },
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
                    ? "bg-[var(--color-primary-lightest)] text-[var(--color-primary)] font-medium"
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
        {activeTab === "category" && <ManageCategory />}
        {activeTab === "category" && <NewsletterAdminPage />}
      </main>
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
