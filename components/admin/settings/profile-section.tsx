"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

/* ---------------- Schema ---------------- */
export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

/* ---------------- Profile Section Component ---------------- */
export function ProfileSection() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  });

  /* Load current user profile */
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/profile");
      const data = await res.json();

      reset({
        name: data.name || "",
        email: data.email || "",
        password: "",
      });
    }

    load();
  }, [reset]);

  /* Submit handler */
  async function onSubmit(data: ProfileData) {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border rounded-2xl shadow-sm divide-y">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold">Profile</h2>
          <p className="text-xs text-gray-500">
            Update your personal account information
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Full Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="New Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />

          <button
            type="submit"
            disabled={loading || !isDirty}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Reusable Input ---------------- */
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
