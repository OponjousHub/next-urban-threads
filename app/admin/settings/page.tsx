// "use client";

// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { settingsSchema } from "@/modules/settings/settings.schema";
// import { z } from "zod";
// import toast from "react-hot-toast";

// type FormData = z.infer<typeof settingsSchema>;

// export default function SettingsPage() {
//   const [loading, setLoading] = useState(false);
//   const [isDirty, setIsDirty] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isDirty: formDirty },
//   } = useForm<FormData>({
//     resolver: zodResolver(settingsSchema),
//   });

//   // 🔥 Load current tenant data
//   useEffect(() => {
//     async function load() {
//       const res = await fetch("/api/admin/settings");
//       const data = await res.json();

//       reset({
//         name: data.name || "",
//         email: data.email || "",
//         currency: data.currency || "USD",
//       });
//     }

//     load();
//   }, [reset]);

//   // 🔥 Submit
//   async function onSubmit(data: FormData) {
//     try {
//       setLoading(true);

//       const res = await fetch("/api/admin/settings", {
//         method: "PATCH",
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) throw new Error();

//       toast.success("Settings updated");
//       setIsDirty(false);
//     } catch {
//       toast.error("Update failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     setIsDirty(formDirty);
//   }, [formDirty]);

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-semibold">Settings</h1>
//         <p className="text-sm text-gray-500">Manage your store preferences</p>
//       </div>

//       {/* Card */}
//       <div className="bg-white border rounded-2xl shadow-sm divide-y">
//         {/* Store Info */}
//         <div className="grid md:grid-cols-3 gap-6 p-6">
//           <div>
//             <h2 className="text-sm font-semibold">Store Info</h2>
//           </div>

//           <div className="md:col-span-2 space-y-4">
//             <Input
//               label="Store Name"
//               error={errors.name?.message}
//               {...register("name")}
//             />

//             <Input
//               label="Email"
//               error={errors.email?.message}
//               {...register("email")}
//             />

//             <Input
//               label="Currency"
//               error={errors.currency?.message}
//               {...register("currency")}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Sticky Save */}
//       {isDirty && (
//         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border shadow-xl rounded-xl px-6 py-3 flex gap-3">
//           <button
//             type="button"
//             onClick={() => window.location.reload()}
//             className="px-3 py-1 border rounded-md"
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-1 bg-indigo-600 text-white rounded-md"
//           >
//             {loading ? "Saving..." : "Save changes"}
//           </button>
//         </div>
//       )}
//     </form>
//   );
// }

// /* Reusable Input */
// function Input({ label, error, ...props }: any) {
//   return (
//     <div>
//       <label className="text-sm font-medium">{label}</label>
//       <input
//         {...props}
//         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//       />
//       {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { ProfileSection } from "@/components/admin/settings/profile-section";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General" },
    { id: "profile", label: "Profile" },
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
