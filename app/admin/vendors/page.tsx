"use client";

import { useState } from "react";
import VendorAprovalPage from "@/components/admin/vendors/vendorApprovalPage";
import VendorManagementPage from "@/components/admin/vendors/vendorManagementPage";
import { useTenant } from "@/store/tenant-provider-context";
import { Label } from "recharts";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  //   const { tenant, storeMode } = useTenant();

  const tabs = [
    { id: "application", label: "Applications" },
    { id: "ManageVendor", label: "Manage vendors" },
  ];

  return (
    <div className="flex gap-8 max-w-[90rem] mx-auto p-6">
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
            Manage vendor {activeTab} settings
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === "application" && <VendorAprovalPage />}
        {activeTab === "ManageVendor" && <VendorManagementPage />}
      </main>
    </div>
  );
}
