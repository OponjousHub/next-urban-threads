"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import ChangEmailModal from "@/components/change-email-modal";
import { useTenant } from "@/store/tenant-provider-context";

export default function EditProfilePage() {
  const [image, setImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tenant } = useTenant();
  const initials = form.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
        });
        setImage(data.avatarUrl ?? null);
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

  // PROCESSING PROFILE IMAGE

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "profile_photos");

      // Send file to YOUR API
      const res = await fetch("/api/profile/profile-photo", {
        method: "POST",
        body: formData,
      });

      const cloudData = await res.json();

      // Save URL in your DB
      await fetch("/api/profile/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: cloudData.url,
        }),
      });

      setImage(cloudData.url);

      // ✅ Show toast notification
      toast.success(`Profile photo updated successfully`, {
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
    } catch (error) {
      toast.error(`Failed to upload profile photo!!`, {
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
    } finally {
      setUploading(false);
    }
  };

  // CHANGE USER EMAIL
  // const changeEmail = async () => {
  //   await fetch("/api/profile/change-email", {
  //     method: "PATCH",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ newEmail }),
  //   });

  //   toast.success("Check your email to verify change");
  // };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Page title */}
          <div>
            <h1 className="mb-6 text-2xl font-semibold text-gray-800">
              Account Settings
            </h1>
          </div>
          {/* Avatar Panel */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative h-28 w-28">
                {image ? (
                  <Image
                    src={image}
                    alt="Profile photo"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-600">
                    {initials || "U"}
                  </div>
                )}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                {form.name || "User"}
              </h3>

              <p className="text-sm text-gray-500">{form.email}</p>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:bg-gray-200"
              >
                {uploading ? "Uploading..." : "Change photo"}
              </button>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                Edit Profile
              </h2>
              <p className="text-sm text-gray-500">
                Update your personal information
              </p>
            </div>
            <div className="md:col-span-2">
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
                  {/* <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p> */}
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Change Email
                  </button>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
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

        <ChangEmailModal open={open} onClose={() => setOpen(false)} />
      </div>
    </div>
  );
}
