import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpload } from "./tenant-images";
import { z } from "zod";
import { appToast } from "@/utils/appToast";

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
      appToast.success("Update settings", "Settings updated successfully");
    } catch {
      appToast.error("Error", "Failed to update store information!");
    } finally {
      setLoading(false);
    }
  }

  // Upload logo to cloudinary
  const heroImage = watch("heroImage");
  const logo = watch("logo");

  const values = watch();

  const fields = [
    values.logo,
    values.heroImage,
    values.name,
    values.email,
    values.currency,
    values.primaryColor,
    values.timezone,
    values.heroTitle,
    values.heroSubtitle,
    values.address,
    values.heroCTA,
  ];

  const completed = fields.filter(
    (value) => value && value.toString().trim() !== "",
  ).length;

  const percentage = Math.round((completed / fields.length) * 100);

  async function uploadImage(file: File, field: "logo" | "heroImage") {
    const formData = new FormData();
    formData.append("image", file); // ✅ FIXED

    if (file.size > 2 * 1024 * 1024) {
      appToast.warning("Warning", "Image must be under 2MB");
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
      appToast.success(
        "Success",
        `${field === "logo" ? "Logo" : "Hero image"} uploaded!`,
      );
    } catch (err) {
      appToast.error("Error", "Upload failed");
      console.error(err);
    } finally {
      setUploadingField(null);
    }
  }

  const progressColor =
    percentage < 40
      ? "bg-red-500"
      : percentage < 80
        ? "bg-yellow-500"
        : "bg-green-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
        <h2 className="text-sm font-semibold">Store Information</h2>

        {/*Completion bar*/}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Store Profile Completion
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                A complete store profile builds customer trust and improves your
                storefront.
              </p>
            </div>

            <span className="text-2xl font-bold text-[var(--color-primary)]">
              {percentage}%
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full ${progressColor} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {completed} of {fields.length} sections completed.
          </p>
        </div>

        <div className="mt-5 rounded-xl bg-blue-50 p-4">
          <p className="font-medium text-blue-900">Complete these items:</p>

          <ul className="mt-2 space-y-1 text-sm text-blue-700">
            {!values.logo && <li>• Upload your store logo</li>}
            {!values.heroImage && <li>• Upload a hero image</li>}
            {!values.currency && <li>• Chose store currency</li>}
            {!values.heroCTA && <li>• Add hero CTA</li>}
            {!values.heroTitle && (
              <li>
                • Add hero <title></title>
              </li>
            )}
            {!values.address && <li>• Add your business address</li>}
            {!values.heroSubtitle && <li>• Add hero sub title</li>}
          </ul>
        </div>

        {/*Celebrate comletion*/}
        {percentage === 100 && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-700">
              🎉 Congratulations! Your store profile is fully complete.
            </p>

            <p className="mt-1 text-sm text-green-600">
              Customers are more likely to trust and buy from stores with
              complete business information.
            </p>
          </div>
        )}

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
