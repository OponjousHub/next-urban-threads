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
  country: z.string().optional(),
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
  const [initialLoading, setInitialLoading] = useState(true);

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
    defaultValues: {
      name: "",
      email: "",
      country: "",
      currency: "",
      logo: "",
      primaryColor: "",
      timezone: "",
      address: "",
      heroTitle: "",
      heroSubtitle: "",
      heroCTA: "",
      heroImage: "",
    },
  });

  // ---------------------------------------------------------
  // Load store settings
  // ---------------------------------------------------------

  useEffect(() => {
    async function load() {
      try {
        setInitialLoading(true);

        const res = await fetch("/api/admin/settings");

        if (!res.ok) {
          throw new Error("Failed to load settings");
        }

        const data = await res.json();

        reset({
          name: data.name || "",
          email: data.email || "",
          country: data.country || "",
          currency: data.currency || "",

          /*
           * Important:
           * Do NOT use "#000000" as a fallback here.
           *
           * Otherwise an empty primaryColor would be treated as
           * completed by the profile completion calculation.
           */
          primaryColor: data.primaryColor || "",

          logo: data.logo || "",
          timezone: data.timezone || "",
          address: data.address || "",
          heroTitle: data.heroTitle || "",
          heroSubtitle: data.heroSubtitle || "",
          heroCTA: data.heroCTA || "",
          heroImage: data.heroImage || "",
        });
      } catch (error) {
        console.error("Failed to load settings:", error);

        appToast.error("Error", "Failed to load store settings.");
      } finally {
        setInitialLoading(false);
      }
    }

    load();
  }, [reset]);

  // ---------------------------------------------------------
  // Save settings
  // ---------------------------------------------------------

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

      if (!res.ok) {
        throw new Error("Failed to update settings");
      }

      appToast.success("Update settings", "Settings updated successfully");

      /*
       * Keep the saved values as the new clean form state.
       * This also makes isDirty become false after a successful save.
       */
      reset(data);
    } catch (error) {
      console.error("Failed to update settings:", error);

      appToast.error("Error", "Failed to update store information!");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // Watched values
  // ---------------------------------------------------------

  const heroImage = watch("heroImage");
  const logo = watch("logo");

  const values = watch();

  // ---------------------------------------------------------
  // Store profile completion
  //
  // These are the 12 General Settings items that determine
  // the completion percentage.
  //
  // Category, products, shipping, etc. are intentionally
  // NOT included here because they belong to separate
  // store-setup areas.
  // ---------------------------------------------------------

  const completionItems = [
    {
      key: "name",
      label: "Add your store name",
      value: values.name,
    },
    {
      key: "email",
      label: "Add your support email",
      value: values.email,
    },
    {
      key: "country",
      label: "Add your country",
      value: values.country,
    },
    {
      key: "currency",
      label: "Choose your store currency",
      value: values.currency,
    },
    {
      key: "primaryColor",
      label: "Choose your primary color",
      value: values.primaryColor,
    },
    {
      key: "timezone",
      label: "Select your timezone",
      value: values.timezone,
    },
    {
      key: "address",
      label: "Add your business address",
      value: values.address,
    },
    {
      key: "logo",
      label: "Upload your store logo",
      value: values.logo,
    },
    {
      key: "heroImage",
      label: "Upload a hero image",
      value: values.heroImage,
    },
    {
      key: "heroTitle",
      label: "Add your hero title",
      value: values.heroTitle,
    },
    {
      key: "heroSubtitle",
      label: "Add your hero subtitle",
      value: values.heroSubtitle,
    },
    {
      key: "heroCTA",
      label: "Add your hero CTA",
      value: values.heroCTA,
    },
  ];

  const isValueCompleted = (value: unknown) => {
    if (typeof value === "string") {
      return value.trim() !== "";
    }

    return Boolean(value);
  };

  const completed = completionItems.filter((item) =>
    isValueCompleted(item.value),
  ).length;

  const totalItems = completionItems.length;

  const percentage = Math.round((completed / totalItems) * 100);

  const incompleteItems = completionItems.filter(
    (item) => !isValueCompleted(item.value),
  );

  // ---------------------------------------------------------
  // Progress bar color
  // ---------------------------------------------------------

  const progressColor =
    percentage < 40
      ? "bg-red-500"
      : percentage < 80
        ? "bg-yellow-500"
        : "bg-green-500";

  // ---------------------------------------------------------
  // Upload image
  // ---------------------------------------------------------

  async function uploadImage(file: File, field: "logo" | "heroImage") {
    const formData = new FormData();

    formData.append("image", file);

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

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      setValue(field, data.url, {
        shouldDirty: true,
      });

      appToast.success(
        "Success",
        `${field === "logo" ? "Logo" : "Hero image"} uploaded!`,
      );
    } catch (error) {
      console.error(error);

      appToast.error("Error", "Upload failed");
    } finally {
      setUploadingField(null);
    }
  }

  // ---------------------------------------------------------
  // Initial loading state
  // ---------------------------------------------------------

  if (initialLoading) {
    return (
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-32 rounded bg-gray-200" />

          <div className="h-32 rounded-2xl bg-gray-100" />

          <div className="h-24 rounded-xl bg-gray-100" />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-10 rounded-lg bg-gray-100" />
            <div className="h-10 rounded-lg bg-gray-100" />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="h-10 rounded-lg bg-gray-100" />
            <div className="h-10 rounded-lg bg-gray-100" />
            <div className="h-10 rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
        {/* -------------------------------------------------- */}
        {/* Heading */}
        {/* -------------------------------------------------- */}

        <h2 className="text-sm font-semibold">Store Information</h2>

        {/* -------------------------------------------------- */}
        {/* Store Profile Completion */}
        {/* -------------------------------------------------- */}

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

          {/* Progress bar */}

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full ${progressColor} transition-all duration-500`}
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {completed} of {totalItems} settings completed.
          </p>
        </div>

        {/* -------------------------------------------------- */}
        {/* Completion checklist */}
        {/* -------------------------------------------------- */}

        {percentage < 100 ? (
          <div className="mt-5 rounded-xl bg-blue-50 p-4">
            <p className="font-medium text-blue-900">Complete these items:</p>

            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              {incompleteItems.map((item) => (
                <li key={item.key}>• {item.label}</li>
              ))}
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

        {/* -------------------------------------------------- */}
        {/* Store basics */}
        {/* -------------------------------------------------- */}

        <Input label="Store Name" {...register("name")} />

        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input label="Support Email" type="email" {...register("email")} />

            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Input label="Country" {...register("country")} />

            {errors.country && (
              <p className="mt-1 text-xs text-red-500">
                {errors.country.message}
              </p>
            )}
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Currency + Color + Timezone */}
        {/* -------------------------------------------------- */}

        <div className="grid md:grid-cols-3 gap-4">
          {/* Currency */}

          <div>
            <label className="text-sm font-medium">Currency</label>

            <select
              {...register("currency")}
              className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Select currency</option>

              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.label}
                </option>
              ))}
            </select>

            {errors.currency && (
              <p className="mt-1 text-xs text-red-500">
                {errors.currency.message}
              </p>
            )}
          </div>

          {/* Primary Color */}

          <div>
            <label className="text-sm font-medium">Primary Color</label>

            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={values.primaryColor || "#000000"}
                onChange={(event) => {
                  setValue("primaryColor", event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                className="w-full h-[42px] border rounded-lg cursor-pointer"
              />
            </div>

            {!values.primaryColor && (
              <p className="mt-1 text-xs text-gray-500">
                Choose a primary color for your storefront.
              </p>
            )}

            {errors.primaryColor && (
              <p className="mt-1 text-xs text-red-500">
                {errors.primaryColor.message}
              </p>
            )}
          </div>

          {/* Timezone */}

          <div>
            <label className="text-sm font-medium">Timezone</label>

            <select
              {...register("timezone")}
              className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Select timezone</option>

              {timezones.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>

            {errors.timezone && (
              <p className="mt-1 text-xs text-red-500">
                {errors.timezone.message}
              </p>
            )}
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Hero content */}
        {/* -------------------------------------------------- */}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input label="Hero title" {...register("heroTitle")} />

            {errors.heroTitle && (
              <p className="mt-1 text-xs text-red-500">
                {errors.heroTitle.message}
              </p>
            )}
          </div>

          <div>
            <Input label="Hero CTA text" {...register("heroCTA")} />

            {errors.heroCTA && (
              <p className="mt-1 text-xs text-red-500">
                {errors.heroCTA.message}
              </p>
            )}
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Hero subtitle + Address */}
        {/* -------------------------------------------------- */}

        <div>
          <TextArea label="Hero subtitle" {...register("heroSubtitle")} />

          {errors.heroSubtitle && (
            <p className="mt-1 text-xs text-red-500">
              {errors.heroSubtitle.message}
            </p>
          )}
        </div>

        <div>
          <TextArea label="Address" {...register("address")} />

          {errors.address && (
            <p className="mt-1 text-xs text-red-500">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* -------------------------------------------------- */}
        {/* Images */}
        {/* -------------------------------------------------- */}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hero Image */}

          <ImageUpload
            label="Hero Image"
            value={heroImage}
            uploading={uploadingField === "heroImage"}
            onChange={(file) => {
              if (!file) {
                setValue("heroImage", "", {
                  shouldDirty: true,
                });

                return;
              }

              uploadImage(file, "heroImage");
            }}
          />

          {/* Logo */}

          <ImageUpload
            label="Logo"
            value={logo}
            uploading={uploadingField === "logo"}
            onChange={(file) => {
              if (!file) {
                setValue("logo", "", {
                  shouldDirty: true,
                });

                return;
              }

              uploadImage(file, "logo");
            }}
          />
        </div>

        {/* -------------------------------------------------- */}
        {/* Save */}
        {/* -------------------------------------------------- */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !isDirty}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// Reusable Input
// ============================================================

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

// ============================================================
// Reusable TextArea
// ============================================================

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
