"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { email } from "zod";

export default function EditProfilePage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
        });
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      // ✅ Show toast notification
      toast.success(`Profile updated successfully`, {
        duration: 6000,
        style: {
          border: "1px solid #4f46e5",
          padding: "12px",
          color: "#333",
        },
        iconTheme: {
          primary: "#4f46e5",
          secondary: "#fff",
        },
      });
    } else {
      // ✅ Show toast notification
      toast.error(`Failed to update profile!`, {
        duration: 6000,
        style: {
          border: "1px solid #4f46e5",
          padding: "12px",
          color: "#333",
        },
        iconTheme: {
          primary: "#4f46e5",
          secondary: "#fff",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Page title */}
        <h1 className="mb-6 text-2xl font-semibold text-gray-800">
          Account Settings
        </h1>

        {/* Card */}
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-medium text-gray-800">Edit Profile</h2>
            <p className="text-sm text-gray-500">
              Update your personal information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="mt-1 w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                placeholder="+234 801 234 5678"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <Link href={"/dashboard"}>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
