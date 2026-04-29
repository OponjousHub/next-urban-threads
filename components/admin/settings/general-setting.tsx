import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpload } from "./tenant-images";
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
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroCTA: z.string().optional(),
  heroImage: z.string().optional(),
});

/* ✅ FIX */
type FormData = z.infer<typeof settingSchema>;

export default function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<
    "logo" | "heroImage" | null
  >(null);
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

      reset({
        name: data.name || "",
        email: data.email || "",
        currency: data.currency || "",
        logo: data.logo || "",
        primaryColor: data.primaryColor || "#000000",
        timezone: data.timezone || "",
        address: data.address || "",
        heroTitle: data.heroTitle || "",
        heroSubtitle: data.heroSubtitle || "",
        heroCTA: data.heroCTA || "",
        heroImage: data.heroImage || "",
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
        { duration: 6000 },
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
  const heroImage = watch("heroImage");
  const logo = watch("logo");

  async function uploadImage(file: File, field: "logo" | "heroImage") {
    const formData = new FormData();
    formData.append("image", file); // ✅ FIXED

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    try {
      setUploadingField(field);
      const res = await fetch("/api/upload/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setValue(field, data.url, { shouldDirty: true });

      toast.success(`${field === "logo" ? "Logo" : "Hero image"} uploaded!`);
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setUploadingField(null);
    }
  }

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

        <div className="grid md:grid-cols-2 gap-4">
          {/* Primary Color */}
          <Input label="Hero title" {...register("heroTitle")} />

          {/* <Input label="Hero subtitle" {...register("heroSubtitle")} /> */}

          <Input label="Hero CTA text" {...register("heroCTA")} />
        </div>

        {/* Address & Sub Title*/}
        <TextArea label="Hero subtitle" {...register("heroSubtitle")} />
        <TextArea label="Address" {...register("address")} />

        <div className="grid md:grid-cols-2 gap-6">
          <ImageUpload
            label="Hero Image"
            value={heroImage}
            uploading={uploadingField === "heroImage"}
            onChange={(file) => {
              if (!file) {
                setValue("heroImage", "", { shouldDirty: true });
                return;
              }
              uploadImage(file, "heroImage");
            }}
          />

          <ImageUpload
            label="Logo"
            value={logo}
            uploading={uploadingField === "logo"}
            onChange={(file) => {
              if (!file) {
                setValue("logo", "", { shouldDirty: true });
                return;
              }
              uploadImage(file, "logo");
            }}
          />
        </div>

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
