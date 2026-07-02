"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/admin/settings/tenant-images";
import { appToast } from "@/utils/appToast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Vendor = {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;

  logo: string | null;
  banner: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  storeSlug: string | null;
};

type Props = {
  vendor: Vendor;
};

/* ---------------- Schema ---------------- */
const settingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),

  logo: z.string().optional(),
  banner: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  timezone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  storeSlug: z.string().optional(),
});

/* ✅ FIX */
type FormData = z.infer<typeof settingSchema>;

export default function VendorSettingsForm({ vendor }: Props) {
  const router = useRouter();
  console.log("VENDORRRRR", vendor);

  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<
    "logo" | "banner" | null
  >(null);

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(settingSchema),

    defaultValues: {
      name: vendor.name,
      email: vendor.email ?? "",
      phone: vendor.phone ?? "",
      logo: vendor.logo ?? "",
      banner: vendor.banner ?? "",
      description: vendor.description ?? "",
      address: vendor.address ?? "",
      city: vendor.city ?? "",
      state: vendor.state ?? "",
      country: vendor.country ?? "",
      storeSlug: vendor.storeSlug ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/vendor/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Store profile updated");

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Upload logo to cloudinary
  const banner = watch("banner");
  const logo = watch("logo");
  const values = watch();

  const fields = [
    values.logo,
    values.banner,
    values.name,
    values.email,
    values.phone,
    values.description,
    values.country,
    values.state,
    values.city,
    values.address,
    values.storeSlug,
  ];

  const completed = fields.filter(
    (value) => value && value.toString().trim() !== "",
  ).length;

  const percentage = Math.round((completed / fields.length) * 100);

  async function uploadImage(file: File, field: "logo" | "banner") {
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

  //Make the progress feel more rewarding by changing the bar color
  const progressColor =
    percentage < 40
      ? "bg-red-500"
      : percentage < 80
        ? "bg-yellow-500"
        : "bg-green-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        {/* Branding */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Store Branding</h2>

          <p className="mb-6 text-sm text-gray-500">
            Customers will see these images.
          </p>

          {/*Profile completion bar*/}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Store Profile Completion
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  A complete store profile builds customer trust and improves
                  your storefront.
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

          {percentage < 100 ? (
            <div className="mt-5 rounded-xl bg-blue-50 p-4">
              <p className="font-medium text-blue-900">Complete these items:</p>

              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                {!values.logo && <li>• Upload your store logo</li>}
                {!values.banner && <li>• Upload a banner image</li>}
                {!values.description && <li>• Add a business description</li>}
                {!values.phone && <li>• Add a contact phone number</li>}
                {!values.address && <li>• Add your business address</li>}
                {!values.storeSlug && <li>• Choose a store URL</li>}
              </ul>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="font-medium text-green-700">
                🎉 Congratulations! Your store profile is fully complete.
              </p>

              <p className="mt-1 text-sm text-green-600">
                Your storefront is fully configured and ready to impress
                customers.
              </p>
            </div>
          )}

          {/*Banner and Logo*/}
          <div className="grid md:grid-cols-2 gap-6">
            <ImageUpload
              label="Banner"
              value={banner}
              uploading={uploadingField === "banner"}
              onChange={(file) => {
                if (!file) {
                  setValue("banner", "", { shouldDirty: true });
                  return;
                }
                uploadImage(file, "banner");
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
        </div>

        {/* Business */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold">Business Information</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Business Name"
              {...register("name")}
              placeholder="Business Name"
            />
            <Input
              label="Store Slug"
              {...register("storeSlug")}
              placeholder="Store Slug"
            />
            <Input label="Email" {...register("email")} placeholder="Email" />
            <Input
              label="Phone"
              {...register("phone")}
              placeholder="Phone number"
            />
            <Input
              label="country"
              {...register("country")}
              placeholder="Country"
            />
            <Input label="state" {...register("state")} placeholder="State" />
            <Input label="City" {...register("city")} placeholder="City" />
            <Input
              label="Address"
              {...register("address")}
              placeholder="Your address"
            />
          </div>
        </div>

        {/* Description */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">About Store</h2>
          <TextArea
            label="Description"
            {...register("description")}
            placeholder="Tell customers about your business..."
            rows={6}
          />
        </div>

        <div className="flex justify-end">
          <button
            disabled={loading}
            type="submit"
            className="rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
          >
            {loading ? "Saving..." : "Save Changes"}
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
