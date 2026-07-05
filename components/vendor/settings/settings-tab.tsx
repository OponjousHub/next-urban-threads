"use client";

import { useState } from "react";
import { useTenant } from "@/store/tenant-provider-context";
import VendorSettingsForm from "./vendor-settings-form";
import VendorPoliciesPage from "./policy-form";
import PayoutSection from "./payout-section";
import VendorLegalSettings from "./legal-settings";
import SocialSection from "./social-section";

type Vendor = {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;

  logo: string | null;
  banner: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  storeSlug: string | null;
};

type Social = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  whatsapp: string | null;
};

type Props = {
  vendor: Vendor;
  bankAccount: {
    bankName: string;
    bankCode: string;
    accountName: string;
    accountNumber: string;
  } | null;
  social: Social | null;
};

export default function SettingsPage({ vendor, bankAccount, social }: Props) {
  const [activeTab, setActiveTab] = useState("profile");
  const { tenant, storeMode } = useTenant();

  const tabs = [
    { id: "profile", label: "General Store Profile" },
    { id: "payout", label: "Payout" },
    { id: "policy", label: "Shipping and returns" },
    { id: "legal", label: "Legal Settings" },
    { id: "social", label: "Social Media" },
  ];

  return (
    <div className="flex gap-8 w-[80rem] mx-auto p-6">
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
        {activeTab === "profile" && <VendorSettingsForm vendor={vendor} />}
        {activeTab === "payout" && <PayoutSection bankAccount={bankAccount} />}
        {activeTab === "policy" && <VendorPoliciesPage />}
        {activeTab === "legal" && <VendorLegalSettings />}
        {activeTab === "social" && <SocialSection social={social} />}
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
