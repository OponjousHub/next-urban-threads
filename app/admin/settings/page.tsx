"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "./schema";
import { z } from "zod";
import toast from "react-hot-toast";

type FormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty: formDirty },
  } = useForm<FormData>({
    resolver: zodResolver(settingsSchema),
  });

  // 🔥 Load current tenant data
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      reset({
        name: data.name || "",
        email: data.email || "",
        currency: data.currency || "USD",
      });
    }

    load();
  }, [reset]);

  // 🔥 Submit
  async function onSubmit(data: FormData) {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Settings updated");
      setIsDirty(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setIsDirty(formDirty);
  }, [formDirty]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-500">Manage your store preferences</p>
      </div>

      {/* Card */}
      <div className="bg-white border rounded-2xl shadow-sm divide-y">
        {/* Store Info */}
        <div className="grid md:grid-cols-3 gap-6 p-6">
          <div>
            <h2 className="text-sm font-semibold">Store Info</h2>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Input
              label="Store Name"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Currency"
              error={errors.currency?.message}
              {...register("currency")}
            />
          </div>
        </div>
      </div>

      {/* Sticky Save */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border shadow-xl rounded-xl px-6 py-3 flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3 py-1 border rounded-md"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1 bg-indigo-600 text-white rounded-md"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}
    </form>
  );
}

/* Reusable Input */
function Input({ label, error, ...props }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
