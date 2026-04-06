import { useState, useEffect } from "react";
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

  logo: z.string().optional(), // URL
  primaryColor: z.string().optional(),
  timezone: z.string().optional(),
  address: z.string().optional(),
});

/* ✅ FIX */
type FormData = z.infer<typeof settingSchema>;

export default function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const currencies = [
    { code: "USD", label: "US Dollar ($)" },
    { code: "NGN", label: "Nigerian Naira (₦)" },
    { code: "EUR", label: "Euro (€)" },
    { code: "GBP", label: "British Pound (£)" },
    { code: "CAD", label: "Canadian Dollar (C$)" },
    { code: "AUD", label: "Australian Dollar (A$)" },
  ];

  const timezones = Intl.supportedValuesOf("timeZone");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(settingSchema),
  });

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      console.log(data);

      reset({
        name: data.name || "",
        email: data.email || "",
        currency: data.currency || "",
        logo: data.logo || "",
        primaryColor: data.primaryColor || "#000000",
        timezone: data.timezone || "",
        address: data.address || "",
      });
    }

    load();
  }, [reset]);

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

  // Upload logo to cloudinary
  const logo = watch("logo");
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); // same key your backend expects

    try {
      setUploading(true);

      const res = await fetch("/api/upload/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setValue("logo", data.url, { shouldDirty: true });
      toast.success("Logo uploaded!");
    } catch (err) {
      toast.error("Logo upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
        <h2 className="text-sm font-semibold">Store Information</h2>

        {/* Store basics */}
        <Input label="Store Name" {...register("name")} />
        <Input label="Support Email" {...register("email")} />

        {/* Row: Currency + Color + Timezone */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Currency */}
          <div>
            <label className="text-sm font-medium">Currency</label>
            <select
              {...register("currency")}
              className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Color */}
          <div>
            <label className="text-sm font-medium">Primary Color</label>
            <input
              type="color"
              {...register("primaryColor")}
              className="mt-1 w-full h-[42px] border rounded-lg"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="text-sm font-medium">Timezone</label>
            <select
              {...register("timezone")}
              className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Logo</label>

          <div className="border-2 border-dashed rounded-xl p-4 text-center hover:bg-gray-50 transition">
            {uploading ? (
              <p className="text-sm text-gray-500">Uploading...</p>
            ) : logo ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={logo}
                  alt="logo"
                  className="h-16 object-contain rounded border"
                />
                <div className="flex gap-3">
                  {/* Change */}
                  <label className="cursor-pointer text-sm text-[var(--color-primary)]hover:underline">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => setValue("logo", "", { shouldDirty: true })}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block text-sm text-gray-500">
                Click to upload logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Address */}
        <TextArea label="Address" {...register("address")} />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !isDirty}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md text-sm"
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

function TextArea({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea
        {...props}
        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
      />
    </div>
  );
}
