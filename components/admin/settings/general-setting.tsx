import { useState } from "react";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/* ---------------- Schema ---------------- */
export const settingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  currency: z.string().optional(),
});

/* ✅ FIX */
type FormData = z.infer<typeof settingSchema>;

export default function GeneralSettings() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(settingSchema),
  });

  async function onSubmit(data: FormData) {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.custom(
        <AdminToast
          type="success"
          title="Update settings"
          description="Settings updated successfully"
        />,
        { duration: 4000 },
      );
    } catch {
      toast.custom(
        <AdminToast
          type="error"
          title="Update failed"
          description={"Failed to update store information!"}
        />,
        { duration: 6000 },
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
        <h2 className="text-sm font-semibold">Store Information</h2>

        <Input label="Store Name" {...register("name")} />

        <Input label="Support Email" {...register("email")} />

        <Input label="Currency" {...register("currency")} />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !isDirty}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

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
