"use client";

import { useState } from "react";
import { ProfileSection } from "@/components/admin/settings/profile-section";
import ChangePasswordAdmin from "@/components/admin/settings/change-password-setting";
import GeneralSettings from "@/components/admin/settings/general-setting";
import ManageCategory from "@/components/admin/settings/category-setting";
import NewsletterAdminPage from "@/components/admin/settings/manage-subscription";
import PolicyForm from "@/components/admin/settings/policy-form";
import StoreModeToggle from "@/components/admin/settings/storeModeToggle";
import FAQForm from "@/components/admin/settings/FAQForm/faq-form";
import AboutSettings from "../content/about/page";
import LegalSettings from "../content/legal/page";
import { useTenant } from "@/store/tenant-provider-context";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

type AdminProps = {
  admin: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
};

export default function SettingsPageUI({ admin }: AdminProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { storeMode } = useTenant();

  const tabs = [
    { id: "general", label: "General" },
    { id: "profile", label: "Profile" },
    { id: "password", label: "Change password" },
    { id: "category", label: "Manage category" },
    { id: "newsletter", label: "Manage Newsletter" },
    { id: "policies", label: "Shipping & Return" },
    { id: "about", label: "Manage About Us" },
    { id: "legal", label: "Legal setting" },
    { id: "storeMode", label: "Manage store mode" },
    { id: "faqs", label: "FAQs" },
  ];

  return (
    <>
      <AdminHeaderUI
        title="Settings Page"
        subtitle="Manage your Settings and more"
        admin={admin}
      />

      <div className="flex w-full max-w-6xl flex-col lg:flex-row items-start gap-4 lg:gap-8 mx-auto px-3 py-4 sm:p-6 min-h-0">
        {/* Mobile Settings Menu */}
        <div className="w-full lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm"
          >
            <span className="text-sm font-medium text-gray-800">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </span>

            <span className="text-gray-500 text-lg">
              {mobileMenuOpen ? "−" : "+"}
            </span>
          </button>

          {mobileMenuOpen && (
            <div className="mt-2 rounded-xl border bg-white p-2 shadow-sm">
              <nav className="grid grid-cols-2 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`rounded-lg px-3 py-3 text-left text-sm transition ${
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
          )}
        </div>

        {/* Desktop Sidebar — preserve existing design */}
        <aside className="hidden lg:block w-56 shrink-0">
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

        {/* Settings Content */}
        <main className="w-full flex-1 min-w-0 min-h-0 space-y-6">
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
          {activeTab === "newsletter" && <NewsletterAdminPage />}
          {activeTab === "policies" && <PolicyForm />}
          {activeTab === "faqs" && <FAQForm />}
          {activeTab === "about" && <AboutSettings />}
          {activeTab === "legal" && <LegalSettings />}

          {activeTab === "storeMode" && (
            <StoreModeToggle
              initialMode={storeMode === "SINGLE_VENDOR" ? "SINGLE" : "MULTI"}
            />
          )}
        </main>
      </div>
    </>
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
